import type { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { createApiError } from "./error-handler";

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate query parameters
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      // Validate URL parameters
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      next(error); // Will be handled by error middleware
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 10, 100) : 10),
  }),

  // ID parameter
  idParam: z.object({
    id: z.string().min(1, "ID is required"),
  }),

  // Search query
  search: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    sortBy: z.string().optional(),
  }),

  // Scan filters
  scanFilters: z.object({
    search: z.string().optional(),
    store: z.string().optional(),
    category: z.string().optional(),
    sortBy: z.string().optional(),
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 10, 100) : 10),
  }),
};

// Sanitization helpers
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Rate limiting validation
export function validateRateLimit(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    const entriesToDelete: string[] = [];
    requests.forEach((data, key) => {
      if (data.resetTime < windowStart) {
        entriesToDelete.push(key);
      }
    });
    entriesToDelete.forEach(key => requests.delete(key));

    const clientData = requests.get(clientId) || { count: 0, resetTime: now + windowMs };

    if (clientData.count >= maxRequests && clientData.resetTime > now) {
      throw createApiError(
        'RATE_LIMIT_EXCEEDED',
        `Too many requests. Try again in ${Math.ceil((clientData.resetTime - now) / 1000)} seconds.`,
        429
      );
    }

    clientData.count++;
    requests.set(clientId, clientData);
    next();
  };
}