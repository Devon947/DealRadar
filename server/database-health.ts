import { db, pool } from "./db";
import { scans, scanResults, observations, users, stores } from "@shared/schema";
import { sql, count, desc, asc } from "drizzle-orm";

export interface HealthCheckResult {
  status: "healthy" | "warning" | "critical";
  message: string;
  metrics?: Record<string, any>;
  timestamp: Date;
}

export interface DatabaseHealthMetrics {
  connectionPool: {
    totalConnections: number;
    idleConnections: number;
    waitingClients: number;
  };
  queryPerformance: {
    avgQueryTime: number;
    slowQueries: number;
  };
  storage: {
    totalScans: number;
    totalScanResults: number;
    totalObservations: number;
    totalUsers: number;
    totalStores: number;
  };
  performance: {
    diskUsage: string;
    cacheHitRatio: number;
  };
  connectivity: {
    canConnect: boolean;
    responseTime: number;
  };
}

export class DatabaseHealthChecker {
  /**
   * Perform a comprehensive health check
   */
  async performHealthCheck(): Promise<{
    overall: HealthCheckResult;
    checks: {
      connectivity: HealthCheckResult;
      performance: HealthCheckResult;
      storage: HealthCheckResult;
      connectionPool: HealthCheckResult;
    };
    metrics: DatabaseHealthMetrics;
  }> {
    const timestamp = new Date();
    
    // Run all checks in parallel
    const [
      connectivityCheck,
      performanceCheck,
      storageCheck,
      poolCheck,
      metrics
    ] = await Promise.all([
      this.checkConnectivity(),
      this.checkPerformance(),
      this.checkStorage(),
      this.checkConnectionPool(),
      this.getHealthMetrics(),
    ]);

    // Determine overall health status
    const checks = {
      connectivity: connectivityCheck,
      performance: performanceCheck,
      storage: storageCheck,
      connectionPool: poolCheck,
    };

    const statuses = Object.values(checks).map(check => check.status);
    let overallStatus: "healthy" | "warning" | "critical" = "healthy";
    
    if (statuses.includes("critical")) {
      overallStatus = "critical";
    } else if (statuses.includes("warning")) {
      overallStatus = "warning";
    }

    const overall: HealthCheckResult = {
      status: overallStatus,
      message: overallStatus === "healthy" 
        ? "Database is operating normally" 
        : overallStatus === "warning"
        ? "Database has some performance issues"
        : "Database has critical issues requiring attention",
      timestamp,
    };

    return {
      overall,
      checks,
      metrics,
    };
  }

  /**
   * Check database connectivity
   */
  async checkConnectivity(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simple connectivity test
      await db.select({ test: sql`1` });
      const responseTime = Date.now() - startTime;

      if (responseTime > 5000) {
        return {
          status: "critical",
          message: `Database connection is very slow (${responseTime}ms)`,
          metrics: { responseTime },
          timestamp: new Date(),
        };
      } else if (responseTime > 1000) {
        return {
          status: "warning",
          message: `Database connection is slow (${responseTime}ms)`,
          metrics: { responseTime },
          timestamp: new Date(),
        };
      }

      return {
        status: "healthy",
        message: `Database connection is responsive (${responseTime}ms)`,
        metrics: { responseTime },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: "critical",
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check database performance metrics
   */
  async checkPerformance(): Promise<HealthCheckResult> {
    try {
      // Check for long-running queries (simulated check)
      const performanceQuery = await db.execute(sql`
        SELECT 
          COUNT(*) as active_queries,
          COALESCE(AVG(EXTRACT(EPOCH FROM (now() - query_start))), 0) as avg_duration
        FROM pg_stat_activity 
        WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%'
      `);

      const activeQueries = parseInt(performanceQuery.rows[0]?.active_queries as string) || 0;
      const avgDuration = parseFloat(performanceQuery.rows[0]?.avg_duration as string) || 0;

      if (activeQueries > 50 || avgDuration > 30) {
        return {
          status: "critical",
          message: `High database load detected (${activeQueries} active queries, avg ${avgDuration.toFixed(2)}s)`,
          metrics: { activeQueries, avgDuration },
          timestamp: new Date(),
        };
      } else if (activeQueries > 20 || avgDuration > 10) {
        return {
          status: "warning",
          message: `Moderate database load (${activeQueries} active queries, avg ${avgDuration.toFixed(2)}s)`,
          metrics: { activeQueries, avgDuration },
          timestamp: new Date(),
        };
      }

      return {
        status: "healthy",
        message: `Database performance is good (${activeQueries} active queries, avg ${avgDuration.toFixed(2)}s)`,
        metrics: { activeQueries, avgDuration },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: "warning",
        message: `Could not check performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check storage and data growth
   */
  async checkStorage(): Promise<HealthCheckResult> {
    try {
      const [
        scanCount,
        scanResultCount,
        observationCount,
      ] = await Promise.all([
        db.select({ count: count() }).from(scans),
        db.select({ count: count() }).from(scanResults),
        db.select({ count: count() }).from(observations),
      ]);

      const totalScans = scanCount[0]?.count || 0;
      const totalScanResults = scanResultCount[0]?.count || 0;
      const totalObservations = observationCount[0]?.count || 0;

      // Check for data growth patterns that might indicate issues
      if (totalObservations > 1000000) {
        return {
          status: "warning",
          message: `Large observation cache detected (${totalObservations.toLocaleString()} entries)`,
          metrics: { totalScans, totalScanResults, totalObservations },
          timestamp: new Date(),
        };
      }

      if (totalScanResults > 500000) {
        return {
          status: "warning",
          message: `Large scan results detected (${totalScanResults.toLocaleString()} entries)`,
          metrics: { totalScans, totalScanResults, totalObservations },
          timestamp: new Date(),
        };
      }

      return {
        status: "healthy",
        message: `Storage levels are normal (${totalScans} scans, ${totalScanResults} results, ${totalObservations} observations)`,
        metrics: { totalScans, totalScanResults, totalObservations },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: "critical",
        message: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check connection pool health
   */
  async checkConnectionPool(): Promise<HealthCheckResult> {
    try {
      const poolInfo = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      };

      if (poolInfo.waitingCount > 10) {
        return {
          status: "critical",
          message: `High connection pool pressure (${poolInfo.waitingCount} waiting clients)`,
          metrics: poolInfo,
          timestamp: new Date(),
        };
      } else if (poolInfo.waitingCount > 5) {
        return {
          status: "warning",
          message: `Moderate connection pool pressure (${poolInfo.waitingCount} waiting clients)`,
          metrics: poolInfo,
          timestamp: new Date(),
        };
      }

      return {
        status: "healthy",
        message: `Connection pool is healthy (${poolInfo.totalCount} total, ${poolInfo.idleCount} idle, ${poolInfo.waitingCount} waiting)`,
        metrics: poolInfo,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: "warning",
        message: `Could not check connection pool: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get comprehensive health metrics
   */
  async getHealthMetrics(): Promise<DatabaseHealthMetrics> {
    const startTime = Date.now();
    
    try {
      const [
        scanCount,
        scanResultCount,
        observationCount,
        userCount,
        storeCount,
      ] = await Promise.all([
        db.select({ count: count() }).from(scans),
        db.select({ count: count() }).from(scanResults),
        db.select({ count: count() }).from(observations),
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(stores),
      ]);

      const connectivityTime = Date.now() - startTime;

      return {
        connectionPool: {
          totalConnections: pool.totalCount,
          idleConnections: pool.idleCount,
          waitingClients: pool.waitingCount,
        },
        queryPerformance: {
          avgQueryTime: connectivityTime / 5, // Rough estimate based on our test queries
          slowQueries: 0, // Would need more sophisticated monitoring
        },
        storage: {
          totalScans: scanCount[0]?.count || 0,
          totalScanResults: scanResultCount[0]?.count || 0,
          totalObservations: observationCount[0]?.count || 0,
          totalUsers: userCount[0]?.count || 0,
          totalStores: storeCount[0]?.count || 0,
        },
        performance: {
          diskUsage: "N/A", // Would need database-specific queries
          cacheHitRatio: 0.95, // Placeholder - would need specific monitoring
        },
        connectivity: {
          canConnect: true,
          responseTime: connectivityTime,
        },
      };
    } catch (error) {
      console.error("Error getting health metrics:", error);
      throw error;
    }
  }

  /**
   * Quick health check for API endpoints
   */
  async quickHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      await db.select({ test: sql`1` });
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 1000 ? "healthy" : responseTime < 3000 ? "warning" : "critical",
        message: `Database responded in ${responseTime}ms`,
        metrics: { responseTime },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: "critical",
        message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const databaseHealthChecker = new DatabaseHealthChecker();