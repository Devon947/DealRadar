// Email API routes for SendPulse integration
import type { Express } from "express";
import { sendPulseService } from "../services/SendPulseService";
import { requireAuth, type AuthenticatedRequest } from "../auth";

export function registerEmailRoutes(app: Express) {
  // Test SendPulse connection
  app.get('/api/email/test', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const result = await sendPulseService.testConnection();
      res.json(result);
    } catch (error) {
      console.error('Email test error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Send welcome email
  app.post('/api/email/welcome', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and name are required' 
        });
      }

      const result = await sendPulseService.sendWelcomeEmail(email, name);
      res.json(result);
    } catch (error) {
      console.error('Welcome email error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Send subscription confirmation email
  app.post('/api/email/subscription-confirmation', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { email, name, planName, planPrice } = req.body;
      
      if (!email || !name || !planName || !planPrice) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email, name, planName, and planPrice are required' 
        });
      }

      const result = await sendPulseService.sendSubscriptionConfirmation(
        email, 
        name, 
        planName, 
        planPrice
      );
      res.json(result);
    } catch (error) {
      console.error('Subscription confirmation email error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Send deal alert email
  app.post('/api/email/deal-alert', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { email, name, deals, storeName } = req.body;
      
      if (!email || !name || !deals || !storeName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email, name, deals, and storeName are required' 
        });
      }

      if (!Array.isArray(deals) || deals.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Deals must be a non-empty array' 
        });
      }

      const result = await sendPulseService.sendDealAlert(email, name, deals, storeName);
      res.json(result);
    } catch (error) {
      console.error('Deal alert email error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Send custom email
  app.post('/api/email/custom', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { to, subject, htmlContent, textContent, fromEmail, fromName } = req.body;
      
      if (!to || !subject || !htmlContent) {
        return res.status(400).json({ 
          success: false, 
          error: 'Recipients (to), subject, and htmlContent are required' 
        });
      }

      // Ensure to is an array
      const recipients = Array.isArray(to) ? to : [to];

      const result = await sendPulseService.sendEmail({
        to: recipients,
        from: { 
          email: fromEmail || 'noreply@dealradar.com', 
          name: fromName || 'DealRadar' 
        },
        subject,
        htmlContent,
        textContent,
      });
      
      res.json(result);
    } catch (error) {
      console.error('Custom email error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}