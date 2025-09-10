import { queryClient } from "@/lib/queryClient";

export interface TelegramDeal {
  id: string;
  productName: string;
  productUrl: string;
  originalPrice?: number;
  currentPrice?: number;
  discount?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  source: string;
  updatedAt: string;
}

export const telegramApi = {
  async getDeals(filters?: {
    category?: string;
    minDiscount?: number;
    maxPrice?: number;
  }): Promise<TelegramDeal[]> {
    const url = new URL("/api/telegram/deals", window.location.origin);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch deals: ${response.statusText}`);
    }
    return response.json();
  },

  async getDealStats(): Promise<{
    totalDeals: number;
    activeDeals: number;
    lastUpdate: string;
  }> {
    const response = await fetch("/api/telegram/stats");
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    return response.json();
  }
};