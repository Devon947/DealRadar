// Define ScrapedProduct interface locally to match the scraper format
export interface ScrapedProduct {
  name: string;
  sku?: string | null;
  originalPrice?: number;
  clearancePrice?: number;
  savingsPercent?: string;
  isOnClearance: boolean;
  isPriceSuppressed: boolean;
  category?: string;
  productUrl: string;
  storeName?: string;
  purchaseInStore?: boolean;
  description?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  source?: string;
}

export interface TelegramDealData {
  productName: string;
  productUrl: string;
  originalPrice?: number;
  salePrice?: number;
  discountPercent?: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  asin?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  source: "telegram_bot";
  timestamp: Date;
}

export interface TelegramScanOptions {
  onProgress?: (status: string, count: number) => void;
  category?: string;
  minDiscount?: number;
  maxPrice?: number;
}

export interface ITelegramProvider {
  init(): Promise<void>;
  fetchDeals(options: TelegramScanOptions): Promise<ScrapedProduct[]>;
  processBotUpdate(dealData: TelegramDealData): Promise<ScrapedProduct>;
}

// In-memory storage for received deals from Telegram bot
class TelegramDealStore {
  private deals: Map<string, TelegramDealData> = new Map();
  private lastUpdate: Date = new Date();

  addDeal(deal: TelegramDealData): void {
    const key = deal.asin || deal.productUrl || deal.productName;
    this.deals.set(key, deal);
    this.lastUpdate = new Date();
  }

  getDeals(filters?: { category?: string; minDiscount?: number; maxPrice?: number }): TelegramDealData[] {
    const dealsArray: TelegramDealData[] = [];
    this.deals.forEach(deal => dealsArray.push(deal));
    let deals = dealsArray;
    
    if (filters?.category) {
      deals = deals.filter(deal => 
        deal.category?.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }
    
    if (filters?.minDiscount && filters.minDiscount > 0) {
      deals = deals.filter(deal => 
        deal.discountPercent && deal.discountPercent >= filters.minDiscount!
      );
    }
    
    if (filters?.maxPrice && filters.maxPrice > 0) {
      deals = deals.filter(deal => 
        deal.salePrice && deal.salePrice <= filters.maxPrice!
      );
    }
    
    // Sort by discount percentage (highest first), then by timestamp (newest first)
    return deals.sort((a, b) => {
      const discountA = a.discountPercent || 0;
      const discountB = b.discountPercent || 0;
      if (discountB !== discountA) {
        return discountB - discountA;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  clearOldDeals(hoursOld: number = 24): void {
    const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    for (const [key, deal] of this.deals.entries()) {
      if (deal.timestamp < cutoff) {
        this.deals.delete(key);
      }
    }
  }

  getLastUpdate(): Date {
    return this.lastUpdate;
  }

  getDealCount(): number {
    return this.deals.size;
  }
}

const telegramStore = new TelegramDealStore();

// Sample deals removed for production deployment - using real data only

export class TelegramAmazonProvider implements ITelegramProvider {
  private initialized = false;

  async init(): Promise<void> {
    // Clean up old deals on initialization
    telegramStore.clearOldDeals(24);
    this.initialized = true;
  }

  getDeals(filters?: { category?: string; minDiscount?: number; maxPrice?: number }): TelegramDealData[] {
    return telegramStore.getDeals(filters);
  }

  getStoreStats() {
    return {
      isActive: true,
      dealCount: telegramStore.getDealCount(),
      lastUpdate: telegramStore.getLastUpdate()
    };
  }

  async fetchDeals(options: TelegramScanOptions): Promise<ScrapedProduct[]> {
    if (!this.initialized) {
      await this.init();
    }

    const totalSteps = 3;
    
    // Progress reporting for UI
    for (let step = 0; step < totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (options.onProgress) {
        const statuses = [
          "Connecting to Amazon via Telegram...",
          "Retrieving latest deals...", 
          "Formatting deal data..."
        ];
        options.onProgress(statuses[step], step + 1);
      }
    }

    // Get deals from Telegram bot data
    const telegramDeals = telegramStore.getDeals({
      category: options.category,
      minDiscount: options.minDiscount,
      maxPrice: options.maxPrice
    });

    // Convert to ScrapedProduct format for consistency with other providers
    const scrapedProducts: ScrapedProduct[] = telegramDeals.map(deal => 
      this.convertTelegramDealToScrapedProduct(deal)
    );

    return scrapedProducts;
  }

  async processBotUpdate(dealData: TelegramDealData): Promise<ScrapedProduct> {
    // Add deal to store
    telegramStore.addDeal(dealData);
    
    // Convert to ScrapedProduct format
    return this.convertTelegramDealToScrapedProduct(dealData);
  }

  private convertTelegramDealToScrapedProduct(deal: TelegramDealData): ScrapedProduct {
    // Calculate savings if we have both original and sale price
    let savingsPercent: string | undefined;
    if (deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice) {
      const savings = ((deal.originalPrice - deal.salePrice) / deal.originalPrice) * 100;
      savingsPercent = savings.toFixed(1);
    } else if (deal.discountPercent) {
      savingsPercent = deal.discountPercent.toString();
    }

    return {
      name: deal.productName,
      sku: deal.asin || "AMZN-" + Date.now().toString(36),
      originalPrice: deal.originalPrice,
      clearancePrice: deal.salePrice,
      savingsPercent,
      isOnClearance: !!deal.salePrice && !!deal.originalPrice && deal.salePrice < deal.originalPrice,
      isPriceSuppressed: !deal.salePrice && !deal.originalPrice,
      category: deal.category || "general",
      productUrl: deal.productUrl,
      storeName: "Amazon",
      purchaseInStore: false, // Amazon is online only
      description: deal.description,
      imageUrl: deal.imageUrl,
      rating: deal.rating,
      reviewCount: deal.reviewCount,
      availability: deal.availability,
      source: "telegram_bot"
    };
  }

  // Utility methods for monitoring
  getStoreStats() {
    return {
      dealCount: telegramStore.getDealCount(),
      lastUpdate: telegramStore.getLastUpdate(),
      isActive: this.initialized
    };
  }

  // Clean up old deals manually
  cleanupOldDeals(hoursOld: number = 24): void {
    telegramStore.clearOldDeals(hoursOld);
  }
}

// Export singleton instance
export const telegramProvider = new TelegramAmazonProvider();