import axios from "axios";
import * as cheerio from "cheerio";
import { type CreateScanRequest, type ScanResult } from "@shared/schema";

interface ScrapingProgress {
  storeIndex: number;
  totalStores: number;
  itemsScraped: number;
  clearanceFound: number;
}

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  zipCode: string;
}

export class EnhancedScraper {
  private progressCallback?: (progress: ScrapingProgress) => void;

  constructor(progressCallback?: (progress: ScrapingProgress) => void) {
    this.progressCallback = progressCallback;
  }

  async scrapeMultipleStores(
    scanRequest: CreateScanRequest,
    storeLocations: StoreLocation[]
  ): Promise<ScanResult[]> {
    const allResults: ScanResult[] = [];
    let totalItemsScraped = 0;
    let totalClearanceFound = 0;

    for (let storeIndex = 0; storeIndex < storeLocations.length; storeIndex++) {
      const store = storeLocations[storeIndex];
      
      try {
        // Update progress
        this.progressCallback?.({
          storeIndex: storeIndex + 1,
          totalStores: storeLocations.length,
          itemsScraped: totalItemsScraped,
          clearanceFound: totalClearanceFound,
        });

        const storeResults = await this.scrapeStore(scanRequest, store);
        allResults.push(...storeResults);
        
        totalItemsScraped += storeResults.length;
        totalClearanceFound += storeResults.filter(r => r.isOnClearance).length;

        // Add delay between stores to be respectful
        await this.delay(2000);
      } catch (error) {
        console.error(`Failed to scrape store ${store.name}:`, error);
        // Continue with other stores
      }
    }

    return this.filterAndSortResults(allResults, scanRequest);
  }

  private async scrapeStore(
    scanRequest: CreateScanRequest,
    store: StoreLocation
  ): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    try {
      // Generate mock realistic data for demonstration
      // In production, this would perform actual web scraping
      const mockProducts = this.generateMockProducts(scanRequest, store);
      
      for (const product of mockProducts) {
        // Apply filters
        if (this.passesFilters(product, scanRequest)) {
          results.push(product);
        }
      }
    } catch (error) {
      console.error(`Scraping error for store ${store.name}:`, error);
    }

    return results;
  }

  private generateMockProducts(
    scanRequest: CreateScanRequest,
    store: StoreLocation
  ): ScanResult[] {
    const categories = ["Tools", "Garden", "Appliances", "Hardware", "Paint", "Lumber", "Lighting"];
    const baseProducts = [
      "Power Drill", "Garden Hose", "Refrigerator", "Hammer", "Wall Paint", "2x4 Lumber", "LED Light",
      "Circular Saw", "Fertilizer", "Dishwasher", "Screwdriver Set", "Primer", "Plywood", "Ceiling Fan",
      "Router", "Mulch", "Microwave", "Wrench Set", "Spray Paint", "Hardwood Flooring", "Pendant Light",
      "Jigsaw", "Plant Pot", "Washing Machine", "Drill Bits", "Interior Paint", "Vinyl Siding", "Chandelier"
    ];

    const products: ScanResult[] = [];
    const numProducts = Math.floor(Math.random() * 25) + 15; // 15-40 products per store

    for (let i = 0; i < numProducts; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const productName = baseProducts[Math.floor(Math.random() * baseProducts.length)];
      const isOnClearance = Math.random() < 0.35; // 35% chance of clearance
      
      const originalPrice = Math.floor(Math.random() * 500) + 20;
      const clearancePrice = isOnClearance 
        ? Math.floor(originalPrice * (0.3 + Math.random() * 0.4)) // 30-70% of original
        : originalPrice;
      
      const savingsPercent = isOnClearance 
        ? Math.round(((originalPrice - clearancePrice) / originalPrice) * 100)
        : 0;

      products.push({
        id: `${store.id}-${i}`,
        scanId: "", // Will be set by caller
        productName: `${productName} - ${category}`,
        sku: `SKU${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        originalPrice: `$${originalPrice.toFixed(2)}`,
        clearancePrice: isOnClearance ? `$${clearancePrice.toFixed(2)}` : null,
        savingsPercent: isOnClearance ? `${savingsPercent}%` : null,
        isOnClearance,
        isPriceSuppressed: Math.random() < 0.05, // 5% chance
        category,
        storeLocation: store.name,
        productUrl: `https://www.homedepot.com/p/product-${i}`,
      });
    }

    return products;
  }

  private passesFilters(product: ScanResult, scanRequest: CreateScanRequest): boolean {
    // Apply clearance only filter
    if (scanRequest.clearanceOnly && !product.isOnClearance) {
      return false;
    }

    // Apply category filter
    if (scanRequest.category && scanRequest.category !== "all" && 
        product.category?.toLowerCase() !== scanRequest.category.toLowerCase()) {
      return false;
    }

    // Apply minimum discount filter
    if (scanRequest.minimumDiscountPercent && product.savingsPercent) {
      const discount = parseInt(product.savingsPercent.replace('%', ''));
      const minDiscount = parseInt(scanRequest.minimumDiscountPercent);
      if (discount < minDiscount) {
        return false;
      }
    }

    // Apply minimum dollars off filter
    if (scanRequest.minimumDollarsOff && product.originalPrice && product.clearancePrice) {
      const original = parseFloat(product.originalPrice.replace('$', ''));
      const clearance = parseFloat(product.clearancePrice.replace('$', ''));
      const dollarsOff = original - clearance;
      const minDollarsOff = parseFloat(scanRequest.minimumDollarsOff);
      if (dollarsOff < minDollarsOff) {
        return false;
      }
    }

    return true;
  }

  private filterAndSortResults(results: ScanResult[], scanRequest: CreateScanRequest): ScanResult[] {
    let filtered = [...results];

    // Sort results
    switch (scanRequest.sortBy) {
      case "discount-percent":
        filtered.sort((a, b) => {
          const aDiscount = a.savingsPercent ? parseInt(a.savingsPercent.replace('%', '')) : 0;
          const bDiscount = b.savingsPercent ? parseInt(b.savingsPercent.replace('%', '')) : 0;
          return bDiscount - aDiscount;
        });
        break;
      case "dollars-off":
        filtered.sort((a, b) => {
          const aDollarsOff = this.calculateDollarsOff(a);
          const bDollarsOff = this.calculateDollarsOff(b);
          return bDollarsOff - aDollarsOff;
        });
        break;
      case "original-price":
        filtered.sort((a, b) => {
          const aPrice = a.originalPrice ? parseFloat(a.originalPrice.replace('$', '')) : 0;
          const bPrice = b.originalPrice ? parseFloat(b.originalPrice.replace('$', '')) : 0;
          return bPrice - aPrice;
        });
        break;
      case "clearance-price":
        filtered.sort((a, b) => {
          const aPrice = a.clearancePrice ? parseFloat(a.clearancePrice.replace('$', '')) : 0;
          const bPrice = b.clearancePrice ? parseFloat(b.clearancePrice.replace('$', '')) : 0;
          return aPrice - bPrice;
        });
        break;
    }

    return filtered;
  }

  private calculateDollarsOff(result: ScanResult): number {
    if (!result.originalPrice || !result.clearancePrice) return 0;
    const original = parseFloat(result.originalPrice.replace('$', ''));
    const clearance = parseFloat(result.clearancePrice.replace('$', ''));
    return original - clearance;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}