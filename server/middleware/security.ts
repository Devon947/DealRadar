import type { Request, Response, NextFunction } from "express";
import { type AuthenticatedRequest } from "../auth";

// SECURITY FIX: Timeout protection for expensive operations
export function withTimeout(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ 
          error: "Request timeout",
          message: "Operation took too long to complete"
        });
      }
    }, timeoutMs);

    // Clear timeout when response is sent
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
}

// SECURITY FIX: Request size limiting to prevent abuse
export function limitRequestSize(maxSizeBytes: number = 1024 * 1024) { // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length']);
      if (contentLength > maxSizeBytes) {
        return res.status(413).json({
          error: "Request too large",
          message: `Request size must be under ${maxSizeBytes / 1024}KB`
        });
      }
    }
    next();
  };
}

// SECURITY FIX: Additional validation for subscription operations
export function validateSubscriptionAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Add additional checks for suspicious activity
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log subscription access attempts for monitoring
  console.log(`[SECURITY] Subscription access: User ${req.session.userId} from IP ${ip} with UA ${userAgent}`);
  
  next();
}

// SECURITY FIX: Prevent plan abuse patterns
export function preventPlanAbuse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { planId } = req.body;
  
  // Log suspicious plan switching patterns
  if (req.session.planChangeHistory) {
    req.session.planChangeHistory.push({
      plan: planId,
      timestamp: Date.now(),
      ip: req.ip
    });
    
    // Check for rapid plan switching (abuse pattern)
    const recentChanges = req.session.planChangeHistory.filter(
      (change: any) => Date.now() - change.timestamp < 5 * 60 * 1000 // 5 minutes
    );
    
    if (recentChanges.length > 3) {
      console.log(`[SECURITY ALERT] Rapid plan switching detected: User ${req.session.userId}`);
      return res.status(429).json({
        error: "Too many plan changes",
        message: "Please wait before changing your subscription plan again"
      });
    }
  } else {
    req.session.planChangeHistory = [{ plan: planId, timestamp: Date.now(), ip: req.ip }];
  }
  
  next();
}