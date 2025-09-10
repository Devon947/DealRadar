import { db } from "./db";
import { observations, stores } from "@shared/schema";
import { eq, and, desc, lt, gt, sql } from "drizzle-orm";

export interface CacheEntry {
  id: string;
  sku: string | null;
  storeId: string;
  productUrl: string;
  clearancePrice: string | null;
  wasPrice: string | null;
  savePercent: string | null;
  inStock: string | null;
  deliveryAvailable: boolean | null;
  isOnClearance: boolean;
  observedAt: Date;
  source: string;
  isValid: boolean;
}

export interface CacheConfig {
  defaultTtlMinutes: number;
  maxCacheSize: number;
  cleanupIntervalMinutes: number;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  defaultTtlMinutes: parseInt(process.env.OBSERVATION_CACHE_TTL_MINUTES || "60"),
  maxCacheSize: parseInt(process.env.OBSERVATION_CACHE_MAX_SIZE || "10000"),
  cleanupIntervalMinutes: parseInt(process.env.OBSERVATION_CACHE_CLEANUP_INTERVAL_MINUTES || "30"),
};

export class ObservationCache {
  private config: CacheConfig;

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config;
  }

  /**
   * Get cached observation for a product URL from a specific store
   */
  async getCachedObservation(
    storeId: string, 
    productUrl: string, 
    maxAgeMinutes: number = this.config.defaultTtlMinutes
  ): Promise<CacheEntry | null> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - maxAgeMinutes);

    try {
      const [cached] = await db
        .select()
        .from(observations)
        .where(
          and(
            eq(observations.storeId, storeId),
            eq(observations.productUrl, productUrl),
            gt(observations.observedAt, cutoffTime)
          )
        )
        .orderBy(desc(observations.observedAt))
        .limit(1);

      if (!cached) {
        return null;
      }

      return {
        id: cached.id,
        sku: cached.sku,
        storeId: cached.storeId,
        productUrl: cached.productUrl,
        clearancePrice: cached.clearancePrice,
        wasPrice: cached.wasPrice,
        savePercent: cached.savePercent,
        inStock: cached.inStock,
        deliveryAvailable: cached.deliveryAvailable,
        isOnClearance: cached.isOnClearance,
        observedAt: cached.observedAt,
        source: cached.source,
        isValid: true,
      };
    } catch (error) {
      console.error("Error getting cached observation:", error);
      return null;
    }
  }

  /**
   * Cache a new observation
   */
  async cacheObservation(
    storeId: string,
    productUrl: string,
    observationData: {
      sku?: string;
      clearancePrice?: string;
      wasPrice?: string;
      savePercent?: string;
      inStock?: string;
      deliveryAvailable?: boolean;
      isOnClearance: boolean;
      source: string;
    }
  ): Promise<string> {
    try {
      const [cached] = await db
        .insert(observations)
        .values({
          storeId,
          productUrl,
          sku: observationData.sku || null,
          clearancePrice: observationData.clearancePrice || null,
          wasPrice: observationData.wasPrice || null,
          savePercent: observationData.savePercent || null,
          inStock: observationData.inStock || null,
          deliveryAvailable: observationData.deliveryAvailable || null,
          isOnClearance: observationData.isOnClearance,
          source: observationData.source,
        })
        .returning({ id: observations.id });

      return cached.id;
    } catch (error) {
      console.error("Error caching observation:", error);
      throw error;
    }
  }

  /**
   * Get multiple cached observations for batch processing
   */
  async getBatchCachedObservations(
    requests: Array<{ storeId: string; productUrl: string }>,
    maxAgeMinutes: number = this.config.defaultTtlMinutes
  ): Promise<Map<string, CacheEntry>> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - maxAgeMinutes);

    // Create a unique key for each request
    const requestKey = (storeId: string, productUrl: string) => `${storeId}:${productUrl}`;
    const requestMap = new Map<string, { storeId: string; productUrl: string }>();
    
    requests.forEach(req => {
      requestMap.set(requestKey(req.storeId, req.productUrl), req);
    });

    try {
      // Build query for all requested observations
      const whereConditions = requests.map(req => 
        and(
          eq(observations.storeId, req.storeId),
          eq(observations.productUrl, req.productUrl),
          gt(observations.observedAt, cutoffTime)
        )
      );

      // Use a more complex query to get latest observation for each store/URL combination
      const cached = await db
        .select()
        .from(observations)
        .where(
          and(
            gt(observations.observedAt, cutoffTime),
            sql`(store_id, product_url, observed_at) IN (
              SELECT store_id, product_url, MAX(observed_at)
              FROM observations
              WHERE observed_at > ${cutoffTime}
              GROUP BY store_id, product_url
            )`
          )
        );

      const resultMap = new Map<string, CacheEntry>();
      
      cached.forEach(obs => {
        const key = requestKey(obs.storeId, obs.productUrl);
        if (requestMap.has(key)) {
          resultMap.set(key, {
            id: obs.id,
            sku: obs.sku,
            storeId: obs.storeId,
            productUrl: obs.productUrl,
            clearancePrice: obs.clearancePrice,
            wasPrice: obs.wasPrice,
            savePercent: obs.savePercent,
            inStock: obs.inStock,
            deliveryAvailable: obs.deliveryAvailable,
            isOnClearance: obs.isOnClearance,
            observedAt: obs.observedAt,
            source: obs.source,
            isValid: true,
          });
        }
      });

      return resultMap;
    } catch (error) {
      console.error("Error getting batch cached observations:", error);
      return new Map();
    }
  }

  /**
   * Invalidate cache entries for a specific store
   */
  async invalidateStoreCache(storeId: string): Promise<number> {
    try {
      const deleted = await db
        .delete(observations)
        .where(eq(observations.storeId, storeId));

      console.log(`Invalidated ${deleted.rowCount || 0} cache entries for store ${storeId}`);
      return deleted.rowCount || 0;
    } catch (error) {
      console.error("Error invalidating store cache:", error);
      throw error;
    }
  }

  /**
   * Invalidate cache entries for a specific product URL across all stores
   */
  async invalidateProductCache(productUrl: string): Promise<number> {
    try {
      const deleted = await db
        .delete(observations)
        .where(eq(observations.productUrl, productUrl));

      console.log(`Invalidated ${deleted.rowCount || 0} cache entries for product ${productUrl}`);
      return deleted.rowCount || 0;
    } catch (error) {
      console.error("Error invalidating product cache:", error);
      throw error;
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredEntries(maxAgeMinutes: number = this.config.defaultTtlMinutes): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - maxAgeMinutes);

    try {
      const deleted = await db
        .delete(observations)
        .where(lt(observations.observedAt, cutoffTime));

      console.log(`Cleaned up ${deleted.rowCount || 0} expired cache entries`);
      return deleted.rowCount || 0;
    } catch (error) {
      console.error("Error cleaning up expired cache entries:", error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    entriesLast24h: number;
    entriesLastHour: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    entriesByStore: Array<{ storeId: string; count: number }>;
  }> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      const [
        totalResult,
        last24hResult,
        lastHourResult,
        oldestResult,
        newestResult,
        byStoreResult,
      ] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(observations),
        db.select({ count: sql`count(*)` }).from(observations).where(gt(observations.observedAt, last24h)),
        db.select({ count: sql`count(*)` }).from(observations).where(gt(observations.observedAt, lastHour)),
        db.select({ oldest: sql`min(observed_at)` }).from(observations),
        db.select({ newest: sql`max(observed_at)` }).from(observations),
        db
          .select({
            storeId: observations.storeId,
            count: sql`count(*)`,
          })
          .from(observations)
          .groupBy(observations.storeId)
          .orderBy(desc(sql`count(*)`)),
      ]);

      return {
        totalEntries: parseInt(totalResult[0]?.count as string) || 0,
        entriesLast24h: parseInt(last24hResult[0]?.count as string) || 0,
        entriesLastHour: parseInt(lastHourResult[0]?.count as string) || 0,
        oldestEntry: oldestResult[0]?.oldest as Date || null,
        newestEntry: newestResult[0]?.newest as Date || null,
        entriesByStore: byStoreResult.map(row => ({
          storeId: row.storeId,
          count: parseInt(row.count as string) || 0,
        })),
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      throw error;
    }
  }

  /**
   * Force cache cleanup to maintain size limits
   */
  async maintainCacheSize(): Promise<number> {
    try {
      // Get current cache size
      const [sizeResult] = await db
        .select({ count: sql`count(*)` })
        .from(observations);

      const currentSize = parseInt(sizeResult?.count as string) || 0;
      
      if (currentSize <= this.config.maxCacheSize) {
        return 0;
      }

      // Calculate how many entries to remove
      const entriesToRemove = currentSize - this.config.maxCacheSize;

      // Remove oldest entries
      const toDelete = await db
        .select({ id: observations.id })
        .from(observations)
        .orderBy(observations.observedAt)
        .limit(entriesToRemove);

      if (toDelete.length === 0) {
        return 0;
      }

      const deletedCount = await db
        .delete(observations)
        .where(sql`id IN (${sql.join(toDelete.map(d => sql`${d.id}`), sql`, `)})`);

      console.log(`Removed ${deletedCount.rowCount || 0} entries to maintain cache size limit`);
      return deletedCount.rowCount || 0;
    } catch (error) {
      console.error("Error maintaining cache size:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const observationCache = new ObservationCache();