import { type Store } from "@shared/schema";
import { createHomeDepotProvider, type HomeDepotDataMode, type HomeDepotScanOptions } from "./providers/homeDepot";
import { createAceHardwareProvider, type AceHardwareDataMode, type AceHardwareScanOptions } from "./providers/aceHardware";
import { getStoreLimitForPlan, type SubscriptionPlan } from "./utils/planLimits";
import { resolveZipCoordinates, selectNearestStoreIds, selectStoresWithinRadius } from "./utils/geoUtils";
import { storage } from "./storage";

export interface ScrapedProduct {
  name: string;
  sku: string;
  originalPrice?: number;
  clearancePrice?: number;
  savingsPercent?: string;
  isOnClearance: boolean;
  isPriceSuppressed: boolean;
  category?: string;
  productUrl?: string;
  purchaseInStore?: boolean;
  storeName?: string;
}

export interface ScrapeOptions {
  zipCode: string;
  radius: string;
  productSelection: "all" | "specific";
  specificSkus?: string[];
  clearanceOnly?: boolean;
  category?: string;
  priceRange?: string;
  onProgress?: (status: string, count: number) => void;
  timeoutMs?: number; // SECURITY FIX: Add configurable timeout
}

export class StoreScraper {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  async scrapeProducts(options: ScrapeOptions, userId?: string): Promise<ScrapedProduct[]> {
    // SECURITY FIX: Set default timeout for scraping operations
    const timeoutMs = options.timeoutMs || 30000; // 30 second default
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Scraping operation timed out')), timeoutMs);
    });
    
    const scrapePromise = this._scrapeProductsInternal(options, userId);
    
    try {
      return await Promise.race([scrapePromise, timeoutPromise]);
    } catch (error) {
      console.error(`[SECURITY] Scraping timeout or error for store ${this.store.id}:`, error);
      throw error;
    }
  }
  
  private async _scrapeProductsInternal(options: ScrapeOptions, userId?: string): Promise<ScrapedProduct[]> {
    if (this.store.id === "home-depot") {
      return this.scrapeHomeDepot(options, userId);
    }
    
    if (this.store.id === "ace-hardware") {
      return this.scrapeAceHardware(options, userId);
    }
    
    throw new Error(`Scraping not implemented for store: ${this.store.name}`);
  }

  private async scrapeHomeDepot(options: ScrapeOptions, userId?: string): Promise<ScrapedProduct[]> {
    // Progress update: Locating nearby stores
    if (options.onProgress) {
      options.onProgress("Locating nearby stores...", 1);
    }

    // Get user information for plan limits and ZIP code
    let storeIds: string[] = ["HD-0206"]; // Default fallback
    if (userId) {
      try {
        const user = await storage.getUserById(userId);
        if (user) {
          const userPlan = (user.subscriptionPlan as SubscriptionPlan) || "free";
          const storeLimit = getStoreLimitForPlan(userPlan);
          
          // Use ZIP code from options first, then fall back to user's ZIP
          const zipCode = options.zipCode || user.zipCode;
          
          if (zipCode) {
            // Import the store data from the real store data file
            const { REAL_HOME_DEPOT_STORES } = await import("../client/src/components/real-store-data");
            
            // Resolve ZIP to coordinates
            const userCoord = resolveZipCoordinates(zipCode, REAL_HOME_DEPOT_STORES);
            
            if (userCoord) {
              // Select nearest stores based on user's plan limit
              storeIds = selectNearestStoreIds(userCoord, REAL_HOME_DEPOT_STORES, storeLimit);
            }
          }
          
          // Progress update with store count
          if (options.onProgress) {
            options.onProgress(`Scanning ${storeIds.length} stores based on your plan...`, 2);
          }
        }
      } catch (error) {
        console.warn("Could not load user for store selection, using defaults:", error);
      }
    }

    // Check environment variables for provider configuration
    const killswitch = process.env.HD_KILLSWITCH === "true";
    const dataMode = (process.env.HD_DATA_MODE as HomeDepotDataMode) || "mock";
    
    // Always use mock mode if killswitch is enabled
    const effectiveMode = killswitch ? "mock" : dataMode;
    
    // Create and initialize the provider
    const provider = createHomeDepotProvider(effectiveMode);
    await provider.init();
    
    // Create extended options with storeIds
    const homeDepotOptions: HomeDepotScanOptions = {
      ...options,
      storeIds
    };
    
    // Fetch deals using the provider
    return await provider.fetchDeals(homeDepotOptions);
  }

  private async scrapeAceHardware(options: ScrapeOptions, userId?: string): Promise<ScrapedProduct[]> {
    // Progress update: Locating nearby stores
    if (options.onProgress) {
      options.onProgress("Locating nearby Ace Hardware stores...", 1);
    }

    // Get user information and ZIP code (no plan limits for Ace Hardware)
    let storeIds: string[] = ["ACE-001"]; // Default fallback
    if (userId) {
      try {
        const user = await storage.getUserById(userId);
        if (user) {
          // Use ZIP code from options first, then fall back to user's ZIP
          const zipCode = options.zipCode || user.zipCode;
          
          if (zipCode) {
            // Import the Ace Hardware store data
            const { REAL_ACE_HARDWARE_STORES } = await import("../client/src/components/ace-store-data");
            
            // Resolve ZIP to coordinates
            const userCoord = resolveZipCoordinates(zipCode, REAL_ACE_HARDWARE_STORES);
            
            if (userCoord) {
              // Select ALL stores within 50-mile radius (no plan limits)
              storeIds = selectStoresWithinRadius(userCoord, REAL_ACE_HARDWARE_STORES, 50);
            }
          }
          
          // Progress update with store count
          if (options.onProgress) {
            options.onProgress(`Scanning ${storeIds.length} Ace Hardware stores within 50 miles...`, 2);
          }
        }
      } catch (error) {
        console.warn("Could not load user for Ace Hardware store selection, using defaults:", error);
      }
    }

    // Check environment variables for provider configuration
    const killswitch = process.env.ACE_KILLSWITCH === "true";
    const dataMode = (process.env.ACE_DATA_MODE as AceHardwareDataMode) || "mock";
    
    // Always use mock mode if killswitch is enabled
    const effectiveMode = killswitch ? "mock" : dataMode;
    
    // Create and initialize the provider
    const provider = createAceHardwareProvider(effectiveMode);
    await provider.init();
    
    // Create extended options with storeIds
    const aceHardwareOptions: AceHardwareScanOptions = {
      ...options,
      storeIds
    };
    
    // Fetch deals using the provider
    return await provider.fetchDeals(aceHardwareOptions);
  }
}
