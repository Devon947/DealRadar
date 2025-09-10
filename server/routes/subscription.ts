import type { Express } from "express";
import { type AuthenticatedRequest } from "../auth";
import { storage } from "../storage";
import { subscriptionRateLimit } from "../middleware/rateLimiter";
import { validateSubscriptionAccess, preventPlanAbuse } from "../middleware/security";
import { z } from "zod";

const createSubscriptionSchema = z.object({
  planId: z.enum(["free", "pro", "business", "pro_annual", "business_annual"]),
});

export function registerSubscriptionRoutes(app: Express) {
  // Create or update subscription - SECURITY FIX: Add comprehensive security
  app.post("/api/subscriptions/create", subscriptionRateLimit, validateSubscriptionAccess, preventPlanAbuse, async (req: AuthenticatedRequest, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { planId } = createSubscriptionSchema.parse(req.body);
      
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For now, we'll directly update the user's plan
      // In a real app, this would integrate with Stripe
      const updatedUser = await storage.updateUserStripeInfo(
        req.session.userId,
        user.stripeCustomerId || undefined,
        user.stripeSubscriptionId || undefined,
        planId
      );

      // SECURITY FIX: Log subscription changes for audit trail
      console.log(`[AUDIT] Subscription change: User ${req.session.userId} changed from ${user.subscriptionPlan} to ${planId} at ${new Date().toISOString()}`);
      
      res.json({
        success: true,
        user: updatedUser,
        message: `Successfully ${planId === 'free' ? 'downgraded to' : planId.includes('annual') ? 'activated annual' : 'upgraded to'} ${planId} plan`,
        auditLog: {
          timestamp: new Date().toISOString(),
          action: 'subscription_change',
          previousPlan: user.subscriptionPlan,
          newPlan: planId
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plan selected", errors: error.errors });
      }
      console.error("Subscription creation failed:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Get current subscription status with usage
  app.get("/api/subscriptions/status", async (req: AuthenticatedRequest, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentMonth = new Date().toISOString().slice(0, 7);
      const scansThisMonth = await storage.getUserScansThisMonth(req.session.userId, currentMonth);
      
      // Import plan limits
      const { getMonthlyScansForPlan, getStoreLimitForPlan } = await import("../utils/planLimits");
      const userPlan = (user.subscriptionPlan as any) || "free";
      const monthlyLimit = getMonthlyScansForPlan(userPlan);
      const storeLimit = getStoreLimitForPlan(userPlan);

      res.json({
        plan: user.subscriptionPlan,
        usage: {
          scansUsed: scansThisMonth.length,
          scansLimit: monthlyLimit,
          scansRemaining: Math.max(0, monthlyLimit - scansThisMonth.length),
          storesPerScan: storeLimit,
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        },
        status: "active"
      });

    } catch (error) {
      console.error("Failed to get subscription status:", error);
      res.status(500).json({ message: "Failed to get subscription status" });
    }
  });
}