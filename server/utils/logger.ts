import { randomUUID } from "crypto";

export interface LogContext {
  correlationId?: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

class Logger {
  private context: LogContext = {};

  setContext(context: Partial<LogContext>) {
    this.context = { ...this.context, ...context };
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const correlationId = this.context.correlationId || randomUUID().substring(0, 8);
    
    const logEntry = {
      timestamp,
      level,
      message,
      correlationId,
      ...this.context,
      ...(meta && { meta }),
    };

    // In development, use readable format
    if (process.env.NODE_ENV === 'development') {
      return `[${timestamp}] ${level.toUpperCase()} [${correlationId}] ${message}${meta ? ` ${JSON.stringify(meta)}` : ''}`;
    }

    // In production, use structured JSON
    return JSON.stringify(logEntry);
  }

  error(message: string, meta?: any) {
    console.error(this.formatMessage(LogLevel.ERROR, message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  info(message: string, meta?: any) {
    console.info(this.formatMessage(LogLevel.INFO, message, meta));
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  // Create a child logger with additional context
  child(context: Partial<LogContext>): Logger {
    const childLogger = new Logger();
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
}

export const logger = new Logger();

// Express middleware for request logging
export function requestLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const correlationId = req.headers['x-correlation-id'] || randomUUID().substring(0, 8);
    
    // Set correlation ID in response headers
    res.setHeader('x-correlation-id', correlationId);
    
    // Create request-scoped logger
    req.logger = logger.child({
      correlationId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    });

    // Log request start
    req.logger.info(`${req.method} ${req.url} - Request started`);

    // Override end to log completion
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding: any) {
      const duration = Date.now() - start;
      req.logger.info(`${req.method} ${req.url} ${res.statusCode} - Completed in ${duration}ms`);
      originalEnd.call(res, chunk, encoding);
    };

    next();
  };
}