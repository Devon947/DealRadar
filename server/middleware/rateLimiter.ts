import rateLimit from "express-rate-limit";

// Rate limiting for scan creation - prevent abuse
export const scanRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // Maximum 5 scans per minute per IP
  message: {
    error: "Too many scan requests from this IP",
    retryAfter: "Please wait 1 minute before creating another scan"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for API endpoints - general protection
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window  
  max: 100, // Maximum 100 requests per minute per IP
  message: {
    error: "Too many requests from this IP",
    retryAfter: "Please slow down your requests"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for subscription changes - prevent rapid plan switching
export const subscriptionRateLimit = rateLimit({
  windowMs: 60 * 1000 * 5, // 5 minute window
  max: 3, // Maximum 3 subscription changes per 5 minutes
  message: {
    error: "Too many subscription changes",
    retryAfter: "Please wait before changing your plan again"  
  },
  standardHeaders: true,
  legacyHeaders: false,
});