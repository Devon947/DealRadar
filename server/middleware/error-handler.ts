import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

export class AppError extends Error implements ApiError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

// Common error types
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export function createApiError(code: keyof typeof ErrorCodes, message: string, statusCode?: number, details?: any): AppError {
  const defaultStatusCodes: Record<string, number> = {
    [ErrorCodes.VALIDATION_ERROR]: 400,
    [ErrorCodes.AUTHENTICATION_REQUIRED]: 401,
    [ErrorCodes.FORBIDDEN]: 403,
    [ErrorCodes.NOT_FOUND]: 404,
    [ErrorCodes.CONFLICT]: 409,
    [ErrorCodes.DATABASE_ERROR]: 500,
    [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  };

  return new AppError(
    ErrorCodes[code],
    message,
    statusCode || defaultStatusCodes[ErrorCodes[code]] || 500,
    details
  );
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Don't log or handle if response already sent
  if (res.headersSent) {
    return next(err);
  }

  let apiError: ApiError;

  if (err instanceof AppError) {
    // Our custom application errors
    apiError = err;
  } else if (err instanceof ZodError) {
    // Zod validation errors
    apiError = createApiError(
      'VALIDATION_ERROR',
      'Invalid request data',
      400,
      {
        validationErrors: err.errors.map(error => ({
          field: error.path.join('.'),
          message: error.message,
          code: error.code,
        }))
      }
    );
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    // Database connection errors
    apiError = createApiError(
      'DATABASE_ERROR',
      'Database temporarily unavailable',
      503
    );
  } else {
    // Unknown errors - don't expose internal details
    console.error('Unhandled error:', err);
    apiError = createApiError(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      500
    );
  }

  // Log errors for debugging (but not validation errors)
  if (apiError.statusCode >= 500) {
    console.error(`[${apiError.code}] ${apiError.message}`, {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      details: apiError.details,
      stack: err.stack,
    });
  }

  // Send structured error response
  res.status(apiError.statusCode).json({
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details && { details: apiError.details }),
      ...(process.env.NODE_ENV === 'development' && err.stack && { stack: err.stack }),
    },
    success: false,
    timestamp: new Date().toISOString(),
  });
}

// Async error wrapper for route handlers
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}