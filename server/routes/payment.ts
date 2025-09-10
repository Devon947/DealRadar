import type { Express } from "express";
import { squareService } from "../services/SquareService";
import { requireAuth, type AuthenticatedRequest } from "../auth";
import { storage } from "../storage";
import { z } from "zod";

// Validation schemas
const createPaymentSchema = z.object({
  sourceId: z.string().min(1, "Payment source ID is required"),
  plan: z.enum(['pro', 'pro_annual', 'business', 'business_annual']),
  customerInfo: z.object({
    givenName: z.string().optional(),
    familyName: z.string().optional(),
    emailAddress: z.string().email().optional(),
    phoneNumber: z.string().optional()
  }).optional()
});

export function registerPaymentRoutes(app: Express) {
  
  // Get subscription pricing
  app.get("/api/payments/pricing", (req, res) => {
    try {
      const pricing = squareService.getSubscriptionPricing();
      res.json(pricing);
    } catch (error) {
      console.error("Failed to get pricing:", error);
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  // Create subscription payment
  app.post("/api/payments/subscription", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = createPaymentSchema.parse(req.body);
      const userId = req.session.userId!;
      
      // Get user information
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate amount for the selected plan
      const planAmount = squareService.calculatePlanAmount(validatedData.plan);
      
      // Create or get Square customer
      let squareCustomerId = user.squareCustomerId;
      
      if (!squareCustomerId && validatedData.customerInfo) {
        const customerResult = await squareService.createCustomer({
          ...validatedData.customerInfo,
          emailAddress: validatedData.customerInfo.emailAddress || user.email || undefined
        });
        
        if (customerResult.success && customerResult.customer) {
          squareCustomerId = customerResult.customer.id;
          // Update user with Square customer ID
          await storage.updateUser(userId, { squareCustomerId });
        }
      }

      // Create payment
      const paymentResult = await squareService.createSubscriptionPayment({
        sourceId: validatedData.sourceId,
        amount: planAmount.amount,
        currency: planAmount.currency,
        customerId: squareCustomerId,
        note: `DealRadar ${validatedData.plan} subscription`
      });

      if (paymentResult.success) {
        // Update user subscription
        await storage.updateUser(userId, {
          subscriptionPlan: validatedData.plan,
          stripeCustomerId: squareCustomerId // Reuse field for Square customer ID
        });

        res.json({
          success: true,
          payment: paymentResult.payment,
          receiptUrl: paymentResult.receiptUrl,
          plan: validatedData.plan
        });
      } else {
        res.status(400).json({
          success: false,
          error: paymentResult.error,
          code: paymentResult.code
        });
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Payment processing failed:", error);
      res.status(500).json({ 
        message: "Payment processing failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user's payment history
  app.get("/api/payments/history", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session.userId!;
      
      // For now, return basic info - in production you'd store payment history
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        currentPlan: user.subscriptionPlan || 'free',
        squareCustomerId: user.squareCustomerId || null,
        // In production, you'd fetch actual payment history from Square or your database
        payments: []
      });
      
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  // Webhook endpoint for Square notifications
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const signature = req.headers['x-square-signature'] as string;
      const body = JSON.stringify(req.body);
      
      // In production, verify webhook signature
      if (process.env.NODE_ENV === 'production' && process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
        const isValid = squareService.verifyWebhookSignature(
          body, 
          signature, 
          process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
        );
        
        if (!isValid) {
          return res.status(401).json({ message: "Invalid webhook signature" });
        }
      }

      // Process webhook events
      const { type, data } = req.body;
      
      console.log(`Received Square webhook: ${type}`, data);
      
      switch (type) {
        case 'payment.created':
          // Handle successful payment
          console.log('Payment created:', data.object.payment);
          break;
          
        case 'payment.updated':
          // Handle payment updates (success, failure, etc.)
          console.log('Payment updated:', data.object.payment);
          break;
          
        default:
          console.log(`Unhandled webhook type: ${type}`);
      }

      res.json({ success: true });
      
    } catch (error) {
      console.error("Webhook processing failed:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });
}