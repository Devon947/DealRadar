import type { Express } from "express";
import { telegramProvider, TelegramDealData } from "../providers/telegram";
import { validateRequest, commonSchemas } from "../middleware/validation";
import { createApiError, asyncHandler } from "../middleware/error-handler";
import { z } from "zod";
import { logger } from "../utils/logger";

// Validation schema for incoming Telegram webhook data
const telegramDealSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productUrl: z.string().url("Valid product URL is required"),
  originalPrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  asin: z.string().optional(),
  availability: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  // Bot authentication
  botToken: z.string().min(1, "Bot token is required for authentication")
});

const telegramBatchSchema = z.object({
  deals: z.array(telegramDealSchema).min(1).max(50), // Limit batch size
  botToken: z.string().min(1, "Bot token is required for authentication")
});

export function registerTelegramRoutes(app: Express) {
  // Webhook endpoint for receiving single deal from Telegram bot
  app.post("/api/telegram/deal", 
    validateRequest({ body: telegramDealSchema }),
    asyncHandler(async (req: any, res: any) => {
      const dealData = req.body;
      const correlationId = req.logger?.context?.correlationId || 'unknown';
      
      // Verify bot token
      const expectedToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!expectedToken) {
        throw createApiError('INTERNAL_SERVER_ERROR', 'Telegram bot not configured', 500);
      }
      
      if (dealData.botToken !== expectedToken) {
        req.logger?.warn("Unauthorized telegram bot request", { 
          providedToken: dealData.botToken?.substring(0, 10) + "..." 
        });
        throw createApiError('FORBIDDEN', 'Invalid bot token', 403);
      }

      // Remove bot token from deal data before processing
      const { botToken, ...cleanDealData } = dealData;
      
      try {
        // Add timestamp and source
        const enrichedDealData: TelegramDealData = {
          ...cleanDealData,
          source: "telegram_bot",
          timestamp: new Date()
        };

        // Process the deal through our provider
        const scrapedProduct = await telegramProvider.processBotUpdate(enrichedDealData);
        
        req.logger?.info("Successfully processed Telegram deal", {
          productName: scrapedProduct.name,
          sku: scrapedProduct.sku,
          category: scrapedProduct.category,
          isOnClearance: scrapedProduct.isOnClearance
        });

        res.json({
          success: true,
          message: "Deal processed successfully",
          data: {
            productName: scrapedProduct.name,
            sku: scrapedProduct.sku,
            isOnClearance: scrapedProduct.isOnClearance,
            processed: true
          },
          correlationId
        });

      } catch (error: any) {
        req.logger?.error("Failed to process Telegram deal", {
          error: error.message,
          productName: cleanDealData.productName
        });
        throw createApiError('INTERNAL_SERVER_ERROR', 'Failed to process deal data', 500);
      }
    })
  );

  // Webhook endpoint for receiving multiple deals (batch processing)
  app.post("/api/telegram/deals/batch",
    validateRequest({ body: telegramBatchSchema }),
    asyncHandler(async (req: any, res: any) => {
      const { deals, botToken } = req.body;
      const correlationId = req.logger?.context?.correlationId || 'unknown';
      
      // Verify bot token
      const expectedToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!expectedToken || botToken !== expectedToken) {
        throw createApiError('FORBIDDEN', 'Invalid bot token', 403);
      }

      const processed: any[] = [];
      const failed: any[] = [];

      for (const dealData of deals) {
        try {
          const { botToken: _, ...cleanDealData } = dealData;
          const enrichedDealData: TelegramDealData = {
            ...cleanDealData,
            source: "telegram_bot",
            timestamp: new Date()
          };

          const scrapedProduct = await telegramProvider.processBotUpdate(enrichedDealData);
          processed.push({
            productName: scrapedProduct.name,
            sku: scrapedProduct.sku,
            success: true
          });
        } catch (error: any) {
          failed.push({
            productName: dealData.productName,
            error: error.message,
            success: false
          });
        }
      }

      req.logger?.info("Batch processed Telegram deals", {
        totalDeals: deals.length,
        processed: processed.length,
        failed: failed.length
      });

      res.json({
        success: true,
        message: `Processed ${processed.length}/${deals.length} deals`,
        data: {
          processed,
          failed,
          summary: {
            total: deals.length,
            successful: processed.length,
            failed: failed.length
          }
        },
        correlationId
      });
    })
  );

  // Get deals endpoint for frontend
  app.get("/api/telegram/deals", asyncHandler(async (req: any, res: any) => {
    try {
      const { category, minDiscount, maxPrice } = req.query;
      
      const filters = {
        category: category as string,
        minDiscount: minDiscount ? Number(minDiscount) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      };

      const deals = telegramProvider.getDeals(filters);
      
      // Transform deals to match TelegramDeal interface
      const transformedDeals = deals.map(deal => ({
        id: deal.productName.toLowerCase().replace(/\s+/g, '-').substring(0, 50),
        productName: deal.productName,
        productUrl: deal.productUrl,
        originalPrice: deal.originalPrice,
        currentPrice: deal.salePrice || deal.originalPrice,
        discount: deal.discountPercent ? `${deal.discountPercent}% off` : undefined,
        description: deal.description,
        imageUrl: deal.imageUrl,
        category: deal.category,
        rating: deal.rating,
        reviewCount: deal.reviewCount,
        availability: deal.availability,
        source: "telegram_bot",
        updatedAt: deal.timestamp?.toISOString() || new Date().toISOString()
      }));
      
      res.json(transformedDeals);
    } catch (error) {
      req.logger?.error("Error fetching Telegram deals:", error);
      res.json([]); // Return empty array on error
    }
  }));

  // Get stats endpoint
  app.get("/api/telegram/stats", asyncHandler(async (req: any, res: any) => {
    try {
      const stats = telegramProvider.getStoreStats();
      
      res.json({
        totalDeals: stats.dealCount,
        activeDeals: stats.dealCount,
        lastUpdate: stats.lastUpdate?.toISOString() || new Date().toISOString()
      });
    } catch (error) {
      req.logger?.error("Error fetching Telegram stats:", error);
      res.json({
        totalDeals: 0,
        activeDeals: 0,
        lastUpdate: new Date().toISOString()
      });
    }
  }));

  // Status endpoint to check Telegram integration health
  app.get("/api/telegram/status", asyncHandler(async (req: any, res: any) => {
    const stats = telegramProvider.getStoreStats();
    const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
    
    res.json({
      success: true,
      data: {
        configured: hasToken,
        active: stats.isActive,
        dealCount: stats.dealCount,
        lastUpdate: stats.lastUpdate,
        uptime: Date.now() - stats.lastUpdate.getTime()
      }
    });
  }));

  // Cleanup endpoint for maintenance
  app.post("/api/telegram/cleanup",
    validateRequest({ 
      body: z.object({
        hoursOld: z.number().min(1).max(168).default(24) // 1 hour to 1 week
      })
    }),
    asyncHandler(async (req: any, res: any) => {
      const { hoursOld } = req.body;
      
      const beforeCount = telegramProvider.getStoreStats().dealCount;
      telegramProvider.cleanupOldDeals(hoursOld);
      const afterCount = telegramProvider.getStoreStats().dealCount;
      
      req.logger?.info("Cleaned up old Telegram deals", {
        hoursOld,
        dealsBefore: beforeCount,
        dealsAfter: afterCount,
        removed: beforeCount - afterCount
      });

      res.json({
        success: true,
        message: `Cleaned up deals older than ${hoursOld} hours`,
        data: {
          dealsBefore: beforeCount,
          dealsAfter: afterCount,
          removed: beforeCount - afterCount
        }
      });
    })
  );
}