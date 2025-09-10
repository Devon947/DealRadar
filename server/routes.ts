import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createScanRequestSchema, insertContactSubmissionSchema, createHomeDepotScanSchema, createAceHardwareScanSchema } from "@shared/schema";
import { StoreScraper } from "./scraper";
import { registerAuthRoutes } from "./auth-routes";
import { registerTelegramRoutes } from "./routes/telegram";
import { registerSubscriptionRoutes } from "./routes/subscription";
import { registerPaymentRoutes } from "./routes/payment";
import { registerEmailRoutes } from "./routes/email";
import { getMonthlyScansForPlan, type SubscriptionPlan } from "./utils/planLimits";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import { scanRateLimit, apiRateLimit } from "./middleware/rateLimiter";
import { withTimeout } from "./middleware/security";
import { z } from "zod";

// Helper function to calculate distance between coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
}

import { zipCodeService } from "./services/ZipCodeService";

// Get coordinates from any ZIP code using comprehensive lookup
async function getZipCodeCoordinates(zipCode: string): Promise<{lat: number, lng: number}> {
  try {
    const coords = await zipCodeService.getCoordinates(zipCode);
    return { lat: coords.lat, lng: coords.lng };
  } catch (error) {
    console.error(`Failed to get coordinates for ZIP ${zipCode}:`, error);
    // Fallback to geographic center of US
    return { lat: 39.8283, lng: -98.5795 };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app);
  
  // Register Telegram bot routes
  registerTelegramRoutes(app);
  
  // Register subscription routes
  registerSubscriptionRoutes(app);
  
  // Register payment routes
  registerPaymentRoutes(app);
  
  // Register email routes
  registerEmailRoutes(app);
  
  // Register shopping list routes
  registerShoppingListRoutes(app);

  // Get available stores
  app.get("/api/stores", apiRateLimit, async (_req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  // ZIP code lookup endpoint
  app.get("/api/zip-lookup/:zipCode", apiRateLimit, async (req, res) => {
    try {
      const { zipCode } = req.params;
      const coordinates = await zipCodeService.getCoordinates(zipCode);
      res.json(coordinates);
    } catch (error) {
      console.error("Failed to lookup ZIP code:", error);
      res.status(500).json({ message: "Failed to lookup ZIP code" });
    }
  });

  // Create a new scan with monthly limits enforcement
  app.post("/api/scans", scanRateLimit, requireAuth, withTimeout(60000), async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = createScanRequestSchema.parse(req.body);
      
      // SECURITY FIX: Use authenticated user ID from session, not request body
      const userId = req.session.userId!;
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // SECURITY FIX: Atomic limit checking to prevent race conditions
      const userPlan = (user.subscriptionPlan as SubscriptionPlan) || "free";
      const monthlyLimit = getMonthlyScansForPlan(userPlan);
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      try {
        // Atomic check and create to prevent race conditions
        const limitCheckResult = await storage.checkAndIncrementScanLimit(userId, currentMonth, monthlyLimit);
        if (!limitCheckResult.allowed) {
          return res.status(429).json({ 
            message: "Monthly scan limit reached",
            limit: monthlyLimit,
            used: limitCheckResult.currentCount,
            upgradeRequired: true,
            resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          });
        }
      } catch (error) {
        console.error("Scan limit check failed:", error);
        return res.status(500).json({ message: "Failed to check scan limits" });
      }
      
      // Verify store exists
      const store = await storage.getStore(validatedData.storeId);
      if (!store) {
        return res.status(400).json({ message: "Invalid store selected" });
      }

      // Create scan record with user's plan and authenticated user ID
      const scanWithPlan = { ...validatedData, userId, plan: userPlan };
      const scan = await storage.createScan(scanWithPlan);
      
      // Start scraping in background with timeout protection
      const scrapingOptions = { ...scanWithPlan, timeoutMs: 45000 }; // 45 second timeout
      performScanInBackground(scan.id, store, scrapingOptions);
      
      const currentUsage = await storage.getUserScansThisMonth(userId, currentMonth);
      res.json({
        ...scan,
        usage: {
          used: currentUsage.length,
          limit: monthlyLimit,
          remaining: monthlyLimit - currentUsage.length
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create scan:", error);
      res.status(500).json({ message: "Failed to create scan" });
    }
  });

  // Get scan status - SECURITY FIX: Verify ownership
  app.get("/api/scans/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session.userId!;
      const scan = await storage.getScanByIdAndUserId(req.params.id, userId);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found or access denied" });
      }
      res.json(scan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scan" });
    }
  });

  // Get scan results - SECURITY FIX: Verify ownership
  app.get("/api/scans/:id/results", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session.userId!;
      const scan = await storage.getScanByIdAndUserId(req.params.id, userId);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found or access denied" });
      }

      const filters = {
        search: req.query.search as string,
        store: req.query.store as string,
        category: req.query.category as string,
        sortBy: req.query.sortBy as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const results = await storage.getScanResults(req.params.id, filters);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scan results" });
    }
  });

  // Get recent scans
  // Get user scans - SECURITY FIX: Add authentication and ownership verification
  app.get("/api/scans", apiRateLimit, requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session.userId!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const scans = await storage.getUserScans(userId, limit);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  // Get user's scans
  app.get("/api/user/scans", async (req: AuthenticatedRequest, res: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const scans = await storage.getUserScans(req.session.userId, limit);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user scans" });
    }
  });

  // Affiliate API routes - Secure with authentication
  app.get("/api/affiliate/stats", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session.userId!;
      const stats = await storage.getAffiliateStats(userId);
      
      // Calculate additional stats
      const conversionRate = stats.clicks > 0 ? (stats.conversions / stats.clicks * 100).toFixed(1) : '0.0';
      const currentMonth = stats.pendingCommissions;
      
      res.json({
        clicks: stats.clicks,
        conversions: stats.conversions,
        currentMonth: currentMonth,
        pending: stats.pendingCommissions,
        annual: stats.totalCommissions,
        conversionRate: parseFloat(conversionRate),
        tier: stats.conversions >= 250 ? "Platinum" : stats.conversions >= 100 ? "Gold" : stats.conversions >= 25 ? "Silver" : "Bronze",
        nextTierProgress: Math.min(100, (stats.conversions % 25) * 4)
      });
    } catch (error: any) {
      console.error('Error fetching affiliate stats:', error);
      res.status(500).json({ message: 'Failed to fetch affiliate stats' });
    }
  });
  
  // Track affiliate click
  app.post("/api/affiliate/click/:referralCode", async (req, res) => {
    try {
      const { referralCode } = req.params;
      const affiliate = await storage.getUserByReferralCode(referralCode);
      
      if (!affiliate) {
        return res.status(404).json({ message: 'Referral code not found' });
      }
      
      await storage.trackAffiliateClick({
        affiliateUserId: affiliate.id,
        referralCode,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error tracking affiliate click:', error);
      res.status(500).json({ message: 'Failed to track click' });
    }
  });
  
  // Referral redirect handler  
  app.get("/r/:referralCode", async (req, res) => {
    try {
      const { referralCode } = req.params;
      const affiliate = await storage.getUserByReferralCode(referralCode);
      
      if (affiliate) {
        // Track the click
        await storage.trackAffiliateClick({
          affiliateUserId: affiliate.id,
          referralCode,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          referer: req.get('Referer'),
        });
      }
      
      // Redirect to signup with referral code
      res.redirect(`/?ref=${referralCode}`);
    } catch (error: any) {
      console.error('Error handling referral redirect:', error);
      res.redirect('/');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function performScanInBackground(scanId: string, store: any, options: any) {
  try {
    await storage.updateScanStatus(scanId, "running");
    
    // Get the scan to extract userId
    const scan = await storage.getScan(scanId);
    const userId = scan?.userId;
    
    const scraper = new StoreScraper(store);
    const scrapedProducts = await scraper.scrapeProducts({
      ...options,
      onProgress: (status: string, count: number) => {
        // In a real app, you might use WebSockets to send progress updates
        console.log(`Scan ${scanId}: ${status} (${count}/5)`);
      },
    }, userId);

    // Save results
    for (const product of scrapedProducts) {
      await storage.createScanResult({
        scanId,
        productName: product.name,
        sku: product.sku || null,
        storeId: "general", // Add required storeId field
        originalPrice: product.originalPrice?.toString(),
        clearancePrice: product.clearancePrice?.toString(),
        savingsPercent: product.savingsPercent,
        isOnClearance: product.isOnClearance,
        isPriceSuppressed: product.isPriceSuppressed,
        category: product.category,
        storeLocation: "Store #0001", // Mock store location
        productUrl: product.productUrl || "",
        wasPrice: product.originalPrice?.toString() || null,
        savePercent: product.savingsPercent || null,
        inStock: null,
        deliveryAvailable: null,
        source: "mock",
        purchaseInStore: false,
        storeName: null,
      });
    }

    const clearanceCount = scrapedProducts.filter(p => p.isOnClearance).length.toString();
    await storage.completeScan(scanId, scrapedProducts.length.toString(), clearanceCount);
    
  } catch (error) {
    console.error(`Scan ${scanId} failed:`, error);
    await storage.updateScanStatus(scanId, "failed");
  }
}

async function performHomeDepotScanInBackground(scanId: string, options: any) {
  try {
    await storage.updateScanStatus(scanId, "running");
    
    // Get the scan to extract userId
    const scan = await storage.getScan(scanId);
    const userId = scan?.userId || "";
    
    const scraper = new StoreScraper({ id: "home-depot", name: "Home Depot", baseUrl: "https://www.homedepot.com", isActive: true });
    const scrapedProducts = await scraper.scrapeProducts({
      zipCode: options.zipCode,
      radius: "25",
      productSelection: "all",
      clearanceOnly: true,
      onProgress: (status: string, count: number) => {
        console.log(`Home Depot Scan ${scanId}: ${status} (${count}/5)`);
      },
    }, userId);

    // Save results with new schema format
    for (const product of scrapedProducts) {
      await storage.createScanResult({
        scanId,
        productName: product.name,
        sku: product.sku || null,
        storeId: "home-depot",
        productUrl: product.productUrl || "",
        wasPrice: product.originalPrice?.toString() || null,
        clearancePrice: product.clearancePrice?.toString() || null,
        savePercent: product.savingsPercent || null,
        inStock: null,
        deliveryAvailable: null,
        source: "alt",
        // In-store purchase fields
        purchaseInStore: product.purchaseInStore || false,
        storeName: product.storeName || null,
        // Legacy fields for backward compatibility
        originalPrice: product.originalPrice?.toString(),
        savingsPercent: product.savingsPercent,
        isOnClearance: product.isOnClearance,
        isPriceSuppressed: product.isPriceSuppressed,
        category: product.category,
        storeLocation: product.storeName || "Home Depot",
      });
    }

    const clearanceCount = scrapedProducts.filter(p => p.isOnClearance).length.toString();
    await storage.completeScan(scanId, scrapedProducts.length.toString(), clearanceCount);
    
  } catch (error) {
    console.error(`Home Depot Scan ${scanId} failed:`, error);
    await storage.updateScanStatus(scanId, "failed");
  }
}

async function performAceHardwareScanInBackground(scanId: string, options: any) {
  try {
    await storage.updateScanStatus(scanId, "running");
    
    // Get the scan to extract userId
    const scan = await storage.getScan(scanId);
    const userId = scan?.userId || "";
    
    const scraper = new StoreScraper({ id: "ace-hardware", name: "Ace Hardware", baseUrl: "https://www.acehardware.com", isActive: true });
    const scrapedProducts = await scraper.scrapeProducts({
      zipCode: options.zipCode,
      radius: "50", // Fixed 50-mile radius for Ace Hardware
      productSelection: "all",
      clearanceOnly: true,
      onProgress: (status: string, count: number) => {
        console.log(`Ace Hardware Scan ${scanId}: ${status} (${count}/5)`);
      },
    }, userId);

    // Save results with new schema format
    for (const product of scrapedProducts) {
      await storage.createScanResult({
        scanId,
        productName: product.name,
        sku: product.sku || null,
        storeId: "ace-hardware",
        productUrl: product.productUrl || "",
        wasPrice: product.originalPrice?.toString() || null,
        clearancePrice: product.clearancePrice?.toString() || null,
        savePercent: product.savingsPercent || null,
        inStock: null,
        deliveryAvailable: null,
        source: "alt",
        // In-store purchase fields
        purchaseInStore: product.purchaseInStore || false,
        storeName: product.storeName || null,
        // Legacy fields for backward compatibility
        originalPrice: product.originalPrice?.toString(),
        savingsPercent: product.savingsPercent,
        isOnClearance: product.isOnClearance,
        isPriceSuppressed: product.isPriceSuppressed,
        category: product.category,
        storeLocation: product.storeName || "Ace Hardware",
      });
    }

    const clearanceCount = scrapedProducts.filter(p => p.isOnClearance).length.toString();
    await storage.completeScan(scanId, scrapedProducts.length.toString(), clearanceCount);
    
  } catch (error) {
    console.error(`Ace Hardware Scan ${scanId} failed:`, error);
    await storage.updateScanStatus(scanId, "failed");
  }
}

// Shopping List API endpoints for the new functionality
export function registerShoppingListRoutes(app: Express) {
  
  // Get user's shopping list
  app.get("/api/shopping-list/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const shoppingItems = await storage.getShoppingListItems(userId);
      res.json(shoppingItems);
    } catch (error) {
      console.error("Failed to fetch shopping list:", error);
      res.status(500).json({ message: "Failed to fetch shopping list" });
    }
  });

  // Add item to shopping list
  app.post("/api/shopping-list", async (req, res) => {
    try {
      const { userId, productId, storeId, productName, targetPrice, notes, aisle, bay } = req.body;
      
      if (!userId || !productId || !storeId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const shoppingItem = await storage.addToShoppingList({
        userId,
        productId,
        storeId,
        productName,
        targetPrice,
        notes,
        aisle,
        bay,
      });
      
      res.json(shoppingItem);
    } catch (error) {
      console.error("Failed to add to shopping list:", error);
      res.status(500).json({ message: "Failed to add item to shopping list" });
    }
  });

  // Update shopping list item (mark as completed, etc.)
  app.patch("/api/shopping-list/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      const updates = req.body;
      
      const updatedItem = await storage.updateShoppingListItem(itemId, updates);
      if (!updatedItem) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Failed to update shopping list item:", error);
      res.status(500).json({ message: "Failed to update shopping list item" });
    }
  });

  // Delete shopping list item
  app.delete("/api/shopping-list/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      
      const deleted = await storage.deleteShoppingListItem(itemId);
      if (!deleted) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }
      
      res.json({ message: "Item removed from shopping list" });
    } catch (error) {
      console.error("Failed to delete shopping list item:", error);
      res.status(500).json({ message: "Failed to delete shopping list item" });
    }
  });

  // Get store locations with proximity sorting and subscription-based filtering
  app.get("/api/store-locations", async (req, res) => {
    try {
      const { zipCode, lat, lng, limit, radius, retailer, storeId } = req.query;
      
      // Get user's subscription plan for proper filtering (default to free for non-authenticated users)
      let userPlan = 'free';
      if (req.session?.userId) {
        const user = await storage.getUserById(req.session.userId);
        userPlan = user?.subscriptionPlan || 'free';
      }
      
      // Import plan limits for accurate subscription-based filtering
      const { getStoreLimitForPlan } = await import('./utils/planLimits');
      const maxStoresByPlan = getStoreLimitForPlan(userPlan as any);
      
      // Apply subscription-based limits (FREE USERS GET EXACTLY 1 STORE)
      const maxStores = parseInt(limit as string) || maxStoresByPlan;
      const maxRadius = radius ? parseFloat(radius as string) : (userPlan !== 'free' ? 50 : null);
      
      // Get all active stores from database
      let activeStores = await storage.getActiveStoreLocations();
      
      // Filter by retailer or storeId if specified
      const storeFilter = retailer || storeId;
      if (storeFilter) {
        const filterValue = storeFilter as string;
        activeStores = activeStores.filter(store => {
          // Map retailer/store names to store ID patterns
          if (filterValue === 'home-depot' || filterValue === 'home_depot') {
            return store.id.startsWith('HD-');
          } else if (filterValue === 'lowes' || filterValue === 'lowe' || filterValue === 'lowes_home_improvement') {
            return store.id.startsWith('LOW-');
          } else if (filterValue === 'ace-hardware' || filterValue === 'ace_hardware') {
            return store.id.startsWith('ACE-');
          } else if (filterValue === 'walmart') {
            return store.id.startsWith('WM-');
          }
          return false; // If store specified but not recognized, return no stores
        });
        console.log(`🏬 Filtered to ${activeStores.length} ${filterValue} stores from ZIP ${zipCode}`);
      }
      
      if ((lat && lng) || zipCode) {
        // Use provided coordinates or lookup zipCode
        let userLat: number, userLng: number;
        
        if (lat && lng) {
          userLat = parseFloat(lat as string);
          userLng = parseFloat(lng as string);
        } else {
          // Use ZIP code service for accurate coordinate lookup
          const zipToCoords = await zipCodeService.getCoordinates(zipCode as string);
          userLat = zipToCoords.lat;
          userLng = zipToCoords.lng;
        }
        
        // Calculate distances and sort by proximity
        const storesWithDistance = activeStores.map(store => {
          const distance = calculateDistance(userLat, userLng, store.latitude || 0, store.longitude || 0);
          return { ...store, distance };
        });
        
        // Filter by radius if specified (for subscribers)
        let filteredStores = storesWithDistance;
        if (maxRadius !== null) {
          filteredStores = storesWithDistance.filter(store => store.distance <= maxRadius);
        }
        
        // Sort by distance and return stores
        const finalStores = filteredStores
          .sort((a, b) => a.distance - b.distance)
          .slice(0, maxStores);
        
        res.json(finalStores);
      } else {
        // Return active stores limited by count
        res.json(activeStores.slice(0, maxStores));
      }
    } catch (error) {
      console.error("Failed to fetch store locations:", error);
      res.status(500).json({ message: "Failed to fetch store locations" });
    }
  });

  // Home Depot-specific scan endpoint
  app.post("/api/home-depot/scan", async (req, res) => {
    try {
      const validatedData = createHomeDepotScanSchema.parse(req.body);
      
      // Create Home Depot scan
      const scan = await storage.createHomeDepotScan(validatedData);
      
      // Start Home Depot scraping in background
      performHomeDepotScanInBackground(scan.id, validatedData);
      
      res.json(scan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create Home Depot scan:", error);
      res.status(500).json({ message: "Failed to create Home Depot scan" });
    }
  });

  // Get Home Depot scan results with summary
  app.get("/api/home-depot/scans/:id/results", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      const results = await storage.getHomeDepotScanResults(req.params.id);
      res.json(results);
    } catch (error) {
      console.error("Failed to fetch Home Depot scan results:", error);
      res.status(500).json({ message: "Failed to fetch scan results" });
    }
  });

  // Ace Hardware-specific scan endpoint
  app.post("/api/ace-hardware/scan", async (req, res) => {
    try {
      const validatedData = createAceHardwareScanSchema.parse(req.body);
      
      // Create Ace Hardware scan
      const scan = await storage.createAceHardwareScan(validatedData);
      
      // Start Ace Hardware scraping in background
      performAceHardwareScanInBackground(scan.id, validatedData);
      
      res.json(scan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create Ace Hardware scan:", error);
      res.status(500).json({ message: "Failed to create Ace Hardware scan" });
    }
  });

  // Get Ace Hardware scan results with summary
  app.get("/api/ace-hardware/scans/:id/results", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      const results = await storage.getAceHardwareScanResults(req.params.id);
      res.json(results);
    } catch (error) {
      console.error("Failed to fetch Ace Hardware scan results:", error);
      res.status(500).json({ message: "Failed to fetch scan results" });
    }
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create contact submission:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });
}
