import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { validateKey } from '../infrastructure/APIKeyVault';

/**
 * 🛡️ Sanitize headers to prevent injection attacks
 */
function sanitizeHeaders(req: Request, res: Response, next: NextFunction): void {
  for (const key in req.headers) {
    const value = req.headers[key];
    if (
      typeof value === 'string' && /[\r\n]/.test(value) ||
      Array.isArray(value) && value.some(v => /[\r\n]/.test(v))
    ) {
      return next(new Error(`Header injection detected in "${key}"`));
    }
  }
  next();
}

/**
 * 🚦 Rate limiter for cockpit-grade throughput control
 */
const cockpitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30,             // max 30 requests per minute
  keyGenerator: (req: Request): string => {
    const userId = req.headers['x-user-id'];
    return typeof userId === 'string' ? userId : 'unknown';
  },
  handler: (_req: Request, res: Response): void => {
    res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      traceId: `trace-${Date.now()}`
    });
  }
});

/**
 * 🔐 Validate API key and user identity
 */
function validateAPIKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];
  const userId = req.headers['x-user-id'];
  const route = req.originalUrl;
  const vehicleId = typeof req.query.vehicleId === 'string' ? req.query.vehicleId : undefined;

  console.log(`[${new Date().toISOString()}] Route: ${route}, User: ${userId}, Vehicle: ${vehicleId}`);

  if (typeof key !== 'string' || typeof userId !== 'string') {
    return res.status(400).json({
      error: 'Missing API credentials',
      code: 'MISSING_CREDENTIALS',
      traceId: `trace-${Date.now()}`
    });
  }

  if (!validateKey(userId, key)) {
    return res.status(403).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY',
      traceId: `trace-${Date.now()}`
    });
  }

  next();
}

/**
 * 🧩 Export full request pipeline
 */
export const requestPipeline = [sanitizeHeaders, cockpitLimiter, validateAPIKey];