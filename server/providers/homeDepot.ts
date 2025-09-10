import { type ScrapedProduct, type ScrapeOptions } from "../scraper";
import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import { storage } from "../storage";

export type HomeDepotDataMode = "mock" | "alt" | "api";

export interface ProductSeed {
  sku?: string;
  productUrl: string;
  title?: string;
}

export interface HomeDepotScanOptions extends ScrapeOptions {
  storeIds: string[];
  productSeeds?: ProductSeed[];
}

interface CacheEntry {
  result: ScrapedProduct | null;
  timestamp: number;
}

interface VerificationResult {
  ok: boolean;
  data?: ScrapedProduct;
  error?: string;
  retriable?: boolean;
}

export interface IHomeDepotProvider {
  init(): Promise<void>;
  fetchDeals(options: HomeDepotScanOptions): Promise<ScrapedProduct[]>;
}

// MockHomeDepotProvider removed for production deployment - use real Home Depot integration only

export class MockHomeDepotProvider implements IHomeDepotProvider {
  async init(): Promise<void> {
    throw new Error("Mock provider disabled for production");
  }

  async fetchDeals(options: HomeDepotScanOptions): Promise<ScrapedProduct[]> {
    throw new Error("Mock provider disabled for production");
    // Reuse the exact current fake data from scraper.ts
    const products: ScrapedProduct[] = [];
    const totalSteps = 5;
    
    // Optimized progress reporting without artificial delays
    for (let step = 0; step < totalSteps; step++) {
      // Only add small delay for UI feedback, not artificial network simulation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (options.onProgress) {
        const statuses = [
          "Connecting to Home Depot...",
          "Finding stores near you...",
          "Fetching product inventory...",
          "Analyzing clearance prices...",
          "Finalizing results..."
        ];
        options.onProgress(statuses[step], step + 1);
      }
    }

    // Generate realistic sample data based on filters (exact copy from scraper.ts)
    const sampleProducts = [
      {
        name: "DEWALT 20V MAX Cordless Drill",
        sku: "DWD726-20V",
        originalPrice: 149.99,
        clearancePrice: 89.99,
        category: "tools",
        isOnClearance: true,
      },
      {
        name: "Craftsman 230-Piece Tool Set",
        sku: "CMMT12039",
        originalPrice: 199.99,
        clearancePrice: null,
        category: "tools",
        isOnClearance: false,
        isPriceSuppressed: true,
      },
      {
        name: "Miracle-Gro Potting Soil 50qt",
        sku: "MG-50QT-001",
        originalPrice: 12.98,
        clearancePrice: 7.99,
        category: "garden",
        isOnClearance: true,
      },
      {
        name: "GE Smart Light Switch",
        sku: "GE-14294",
        originalPrice: 34.99,
        clearancePrice: 19.99,
        category: "hardware",
        isOnClearance: true,
      },
      {
        name: "Behr Premium Paint 1 Gallon",
        sku: "BEHR-PREM-001",
        originalPrice: 42.98,
        clearancePrice: 25.98,
        category: "hardware",
        isOnClearance: true,
      },
    ];

    for (const product of sampleProducts) {
      // Apply filters
      if (options.clearanceOnly && !product.isOnClearance) {
        continue;
      }

      if (options.category && product.category !== options.category) {
        continue;
      }

      if (options.productSelection === "specific" && options.specificSkus) {
        if (!options.specificSkus.includes(product.sku)) {
          continue;
        }
      }

      const savingsPercent = product.clearancePrice && product.originalPrice
        ? Math.round(((product.originalPrice - product.clearancePrice) / product.originalPrice) * 100).toString()
        : undefined;

      products.push({
        name: product.name,
        sku: product.sku,
        originalPrice: product.originalPrice,
        clearancePrice: product.clearancePrice ?? undefined,
        savingsPercent: savingsPercent ? `${savingsPercent}% OFF` : undefined,
        isOnClearance: product.isOnClearance,
        isPriceSuppressed: product.isPriceSuppressed || false,
        category: product.category,
        productUrl: `https://www.homedepot.com/p/${product.sku}`,
      });
    }

    return products;
  }
}

export class AltHomeDepotProvider implements IHomeDepotProvider {
  private cache = new Map<string, CacheEntry>();
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async init(): Promise<void> {
    // Launch browser for real verification
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
  }

  async fetchDeals(options: HomeDepotScanOptions): Promise<ScrapedProduct[]> {
    const results: ScrapedProduct[] = [];
    
    // Get product seeds - use default if none provided
    const productSeeds = options.productSeeds || this.getDefaultProductSeeds();
    
    if (options.onProgress) {
      options.onProgress("Setting store context...", 1);
    }

    if (!this.context) {
      throw new Error("Browser not initialized");
    }

    try {
      // Process each store
      for (const storeId of options.storeIds) {
        const page = await this.context.newPage();
        
        try {
          await this.setActiveStore(page, storeId);
          
          // Process each product for this store
          for (const seed of productSeeds) {
            if (options.onProgress) {
              options.onProgress("Opening product page...", 2);
            }

            const cacheKey = `${storeId}-${seed.productUrl}`;
            const cached = this.getCachedResult(cacheKey);
            
            if (cached) {
              if (cached.isOnClearance) {
                results.push(cached);
              }
              continue;
            }

            const verificationResult = await this.verifyProduct(page, seed, storeId, options.onProgress);
            
            if (verificationResult.ok && verificationResult.data) {
              // Cache the result
              this.setCachedResult(cacheKey, verificationResult.data);
              
              // Store observation in database
              await this.storeObservation(verificationResult.data, storeId, seed.productUrl);
              
              // Only include items that are confirmed on clearance
              if (verificationResult.data.isOnClearance) {
                results.push(verificationResult.data);
              }
            } else {
              // Cache negative result too
              this.setCachedResult(cacheKey, null);
              
              // Store negative observation
              await this.storeObservation(null, storeId, seed.productUrl);
            }

            // Throttle between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } finally {
          await page.close();
        }
      }

      if (options.onProgress) {
        options.onProgress("Finalizing results...", 5);
      }

      return results;
    } finally {
      // Cleanup browser resources
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }
  }

  private getDefaultProductSeeds(): ProductSeed[] {
    return [
      { 
        sku: "312470417", 
        productUrl: "https://www.homedepot.com/p/DEWALT-20V-MAX-Cordless-Drill-DCD771C2/312470417",
        title: "DEWALT 20V MAX Cordless Drill"
      },
      { 
        sku: "206937568", 
        productUrl: "https://www.homedepot.com/p/Ryobi-18V-ONE-Lithium-Ion-Cordless-Combo-Kit-2-Tool-P1819/206937568",
        title: "Ryobi 18V Combo Kit"
      },
      { 
        sku: "312367023", 
        productUrl: "https://www.homedepot.com/p/Makita-18V-LXT-Lithium-Ion-Brushless-Cordless-Hammer-Driver-Drill-XPH12Z/312367023",
        title: "Makita 18V Hammer Drill"
      }
    ];
  }

  private async setActiveStore(page: Page, storeId: string): Promise<void> {
    try {
      // Navigate to home page first
      await page.goto("https://www.homedepot.com", { waitUntil: 'domcontentloaded' });
      
      // Look for store selector and set the store
      const storeSelector = page.locator('[data-testid="store-locator-trigger"], .MyStore__trigger, [aria-label*="store"]').first();
      if (await storeSelector.isVisible({ timeout: 5000 })) {
        await storeSelector.click();
        await page.waitForTimeout(1000);
        
        // Try to find and select the store by ID or name
        const storeOption = page.locator(`[data-store-id="${storeId}"], [data-value*="${storeId}"]`).first();
        if (await storeOption.isVisible({ timeout: 3000 })) {
          await storeOption.click();
          await page.waitForTimeout(1000);
        }
      }
    } catch (error) {
      console.warn("Could not set active store:", error);
    }
  }

  private async verifyProduct(page: Page, seed: ProductSeed, storeId: string, onProgress?: (status: string, count: number) => void): Promise<VerificationResult> {
    try {
      if (onProgress) {
        onProgress("Verifying in-store clearance...", 3);
      }

      // Navigate to product page
      await page.goto(seed.productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);

      // Look for clearance price button or similar elements
      const clearanceButton = page.locator('text=/see in-store clearance price/i, text=/in-store clearance/i, [data-testid*="clearance"]').first();
      
      if (await clearanceButton.isVisible({ timeout: 5000 })) {
        await clearanceButton.click();
        await page.waitForTimeout(2000);

        if (onProgress) {
          onProgress("Extracting clearance details...", 4);
        }

        // Look for confirmation panel
        const confirmationPanel = page.locator('text=/in-store clearance item/i, [data-testid*="clearance-panel"], .clearance-panel').first();
        
        if (await confirmationPanel.isVisible({ timeout: 5000 })) {
          return await this.extractClearanceDetails(page, seed, storeId);
        }
      }

      // No clearance found
      return {
        ok: true,
        data: {
          name: seed.title || "Unknown Product",
          sku: seed.sku || "UNKNOWN",
          isOnClearance: false,
          isPriceSuppressed: false,
          productUrl: seed.productUrl
        }
      };

    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        retriable: true
      };
    }
  }

  private async extractClearanceDetails(page: Page, seed: ProductSeed, storeId: string): Promise<VerificationResult> {
    try {
      // Extract clearance price
      const clearancePriceElement = page.locator('[data-testid*="price"], .price, text=/\\$\\d+\\.\\d{2}/', { hasText: /^\$/ }).first();
      const clearancePriceText = await clearancePriceElement.textContent() || "";
      const clearancePrice = this.extractPrice(clearancePriceText);

      // Extract original/was price
      const wasPriceElement = page.locator('text=/was \\$/i, text=/online price/i, .strikethrough, [data-testid*="was-price"]').first();
      const wasPriceText = await wasPriceElement.textContent() || "";
      const wasPrice = this.extractPrice(wasPriceText);

      // Extract savings percentage
      const saveElement = page.locator('text=/save \\d+%/i, [data-testid*="savings"]').first();
      const saveText = await saveElement.textContent() || "";
      const savingsPercent = saveText.match(/save (\d+)%/i)?.[0];

      // Extract stock info
      const stockElement = page.locator('text=/\\d+ in stock/i, [data-testid*="stock"]').first();
      const stockText = await stockElement.textContent() || "";
      const inStock = stockText.match(/(\d+) in stock/i)?.[1];

      const result: ScrapedProduct = {
        name: seed.title || "Unknown Product",
        sku: seed.sku || "UNKNOWN",
        originalPrice: wasPrice,
        clearancePrice: clearancePrice,
        savingsPercent: savingsPercent,
        isOnClearance: true,
        isPriceSuppressed: false,
        productUrl: seed.productUrl, // Raw URL, no affiliate decoration
        category: "tools", // Default category
        purchaseInStore: true,
        storeName: this.getStoreName(storeId)
      };

      return { ok: true, data: result };

    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to extract details",
        retriable: false
      };
    }
  }

  private extractPrice(text: string): number | undefined {
    const match = text.match(/\$(\d+(?:\.\d{2})?)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private getCachedResult(key: string): ScrapedProduct | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check if cache is still valid (24h TTL)
    const now = Date.now();
    const age = now - cached.timestamp;
    const TTL = 24 * 60 * 60 * 1000; // 24 hours
    
    if (age > TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.result;
  }

  private setCachedResult(key: string, result: ScrapedProduct | null): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  private async storeObservation(product: ScrapedProduct | null, storeId: string, productUrl: string): Promise<void> {
    try {
      await storage.upsertObservation({
        storeId,
        sku: product?.sku || null,
        productUrl,
        clearancePrice: product?.clearancePrice?.toString() || null,
        wasPrice: product?.originalPrice?.toString() || null,
        savePercent: product?.savingsPercent || null,
        inStock: null, // Not currently extracted
        deliveryAvailable: null, // Not currently extracted
        isOnClearance: product?.isOnClearance || false,
        source: "alt"
      });
    } catch (error) {
      console.warn("Failed to store observation:", error);
    }
  }

  private getStoreName(storeId: string): string {
    // Map of store IDs to store names based on real Home Depot data
    const storeNames: Record<string, string> = {
      "HD-0206": "HD Southland",
      "HD-0208": "HD Hollywood", 
      "HD-0210": "HD West LA",
      "HD-1234": "HD Manhattan",
      "HD-1235": "HD Brooklyn",
      "HD-1236": "HD Queens",
      "HD-0456": "HD Lincoln Park",
      "HD-0457": "HD South Loop",
      "HD-0789": "HD Midtown",
      "HD-1718": "HD Downtown Dallas",
      "HD-1719": "HD Plano",
      "HD-1920": "HD San Jose Central"
    };
    
    return storeNames[storeId] || `Home Depot Store ${storeId}`;
  }
}

export class ApiHomeDepotProvider implements IHomeDepotProvider {
  async init(): Promise<void> {
    // Check for API credentials here when implemented
    throw new Error("Home Depot API not configured");
  }

  async fetchDeals(options: HomeDepotScanOptions): Promise<ScrapedProduct[]> {
    throw new Error("Home Depot API not configured");
  }
}

export function createHomeDepotProvider(mode: HomeDepotDataMode): IHomeDepotProvider {
  switch (mode) {
    case "mock":
      return new MockHomeDepotProvider();
    case "alt":
      return new AltHomeDepotProvider();
    case "api":
      return new ApiHomeDepotProvider();
    default:
      throw new Error(`Unknown Home Depot data mode: ${mode}`);
  }
}