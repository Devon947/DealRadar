import { db } from "./db";
import { scans, scanResults, observations, priceHistory } from "@shared/schema";
import { lt, and, eq, sql, inArray } from "drizzle-orm";

export interface RetentionConfig {
  completedScansRetentionDays: number;
  observationsRetentionDays: number;
  priceHistoryRetentionDays: number;
  failedScansRetentionDays: number;
}

// Default retention policies (configurable via environment)
const DEFAULT_RETENTION: RetentionConfig = {
  completedScansRetentionDays: parseInt(process.env.COMPLETED_SCANS_RETENTION_DAYS || "30"),
  observationsRetentionDays: parseInt(process.env.OBSERVATIONS_RETENTION_DAYS || "7"),
  priceHistoryRetentionDays: parseInt(process.env.PRICE_HISTORY_RETENTION_DAYS || "90"),
  failedScansRetentionDays: parseInt(process.env.FAILED_SCANS_RETENTION_DAYS || "7"),
};

export class DataRetentionService {
  private config: RetentionConfig;

  constructor(config: RetentionConfig = DEFAULT_RETENTION) {
    this.config = config;
  }

  /**
   * Clean up completed scans older than retention period
   */
  async cleanupCompletedScans(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.completedScansRetentionDays);

    try {
      // Get scans to be deleted first
      const scansToDelete = await db
        .select({ id: scans.id })
        .from(scans)
        .where(
          and(
            eq(scans.status, "completed"),
            lt(scans.completedAt, cutoffDate)
          )
        );

      if (scansToDelete.length === 0) {
        return 0;
      }

      const scanIds = scansToDelete.map(s => s.id);

      // Delete scan results first (foreign key constraint)
      await db.delete(scanResults).where(
        inArray(scanResults.scanId, scanIds)
      );

      // Delete the scans
      const deletedScans = await db.delete(scans).where(
        and(
          eq(scans.status, "completed"),
          lt(scans.completedAt, cutoffDate)
        )
      );

      console.log(`Cleaned up ${scansToDelete.length} completed scans older than ${this.config.completedScansRetentionDays} days`);
      return scansToDelete.length;
    } catch (error) {
      console.error("Error cleaning up completed scans:", error);
      throw error;
    }
  }

  /**
   * Clean up failed scans older than retention period
   */
  async cleanupFailedScans(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.failedScansRetentionDays);

    try {
      // Get failed scans to delete
      const scansToDelete = await db
        .select({ id: scans.id })
        .from(scans)
        .where(
          and(
            eq(scans.status, "failed"),
            lt(scans.createdAt, cutoffDate)
          )
        );

      if (scansToDelete.length === 0) {
        return 0;
      }

      const scanIds = scansToDelete.map(s => s.id);

      // Delete scan results first
      await db.delete(scanResults).where(
        inArray(scanResults.scanId, scanIds)
      );

      // Delete the failed scans
      await db.delete(scans).where(
        and(
          eq(scans.status, "failed"),
          lt(scans.createdAt, cutoffDate)
        )
      );

      console.log(`Cleaned up ${scansToDelete.length} failed scans older than ${this.config.failedScansRetentionDays} days`);
      return scansToDelete.length;
    } catch (error) {
      console.error("Error cleaning up failed scans:", error);
      throw error;
    }
  }

  /**
   * Clean up old observations beyond cache TTL
   */
  async cleanupObservations(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.observationsRetentionDays);

    try {
      const deletedObservations = await db.delete(observations).where(
        lt(observations.observedAt, cutoffDate)
      );

      console.log(`Cleaned up observations older than ${this.config.observationsRetentionDays} days`);
      return deletedObservations.rowCount || 0;
    } catch (error) {
      console.error("Error cleaning up observations:", error);
      throw error;
    }
  }

  /**
   * Clean up old price history data
   */
  async cleanupPriceHistory(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.priceHistoryRetentionDays);

    try {
      const deletedPriceHistory = await db.delete(priceHistory).where(
        lt(priceHistory.recordedAt, cutoffDate)
      );

      console.log(`Cleaned up price history older than ${this.config.priceHistoryRetentionDays} days`);
      return deletedPriceHistory.rowCount || 0;
    } catch (error) {
      console.error("Error cleaning up price history:", error);
      throw error;
    }
  }

  /**
   * Run all cleanup tasks
   */
  async runFullCleanup(): Promise<{
    completedScans: number;
    failedScans: number;
    observations: number;
    priceHistory: number;
  }> {
    console.log("Starting data retention cleanup...");
    
    const results = {
      completedScans: await this.cleanupCompletedScans(),
      failedScans: await this.cleanupFailedScans(),
      observations: await this.cleanupObservations(),
      priceHistory: await this.cleanupPriceHistory(),
    };

    console.log("Data retention cleanup completed:", results);
    return results;
  }

  /**
   * Get current data statistics
   */
  async getDataStatistics(): Promise<{
    totalScans: number;
    pendingScans: number;
    runningScans: number;
    completedScans: number;
    failedScans: number;
    totalScanResults: number;
    totalObservations: number;
    oldestScan: Date | null;
    newestScan: Date | null;
  }> {
    try {
      const [
        totalScansResult,
        pendingScansResult,
        runningScansResult,
        completedScansResult,
        failedScansResult,
        totalScanResultsResult,
        totalObservationsResult,
        oldestScanResult,
        newestScanResult,
      ] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(scans),
        db.select({ count: sql`count(*)` }).from(scans).where(eq(scans.status, "pending")),
        db.select({ count: sql`count(*)` }).from(scans).where(eq(scans.status, "running")),
        db.select({ count: sql`count(*)` }).from(scans).where(eq(scans.status, "completed")),
        db.select({ count: sql`count(*)` }).from(scans).where(eq(scans.status, "failed")),
        db.select({ count: sql`count(*)` }).from(scanResults),
        db.select({ count: sql`count(*)` }).from(observations),
        db.select({ minDate: sql`min(created_at)` }).from(scans),
        db.select({ maxDate: sql`max(created_at)` }).from(scans),
      ]);

      return {
        totalScans: parseInt(totalScansResult[0]?.count as string) || 0,
        pendingScans: parseInt(pendingScansResult[0]?.count as string) || 0,
        runningScans: parseInt(runningScansResult[0]?.count as string) || 0,
        completedScans: parseInt(completedScansResult[0]?.count as string) || 0,
        failedScans: parseInt(failedScansResult[0]?.count as string) || 0,
        totalScanResults: parseInt(totalScanResultsResult[0]?.count as string) || 0,
        totalObservations: parseInt(totalObservationsResult[0]?.count as string) || 0,
        oldestScan: oldestScanResult[0]?.minDate as Date || null,
        newestScan: newestScanResult[0]?.maxDate as Date || null,
      };
    } catch (error) {
      console.error("Error getting data statistics:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const dataRetentionService = new DataRetentionService();