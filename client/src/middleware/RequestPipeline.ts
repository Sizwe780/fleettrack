// src/middleware/requestPipeline.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { validateKey } from '../infrastructure/APIKeyVault';

/** small helper to create trace ids */
function makeTraceId() {
  return `trace-${Date.now()}`;
}

/**
 * 🛡️ Sanitize headers to prevent injection attacks
 */
function sanitizeHeaders(req: Request, _res: Response, next: NextFunction): void {
  // iterate only own header keys
  for (const key of Object.keys(req.headers)) {
    const value = req.headers[key];
    const hasInjection =
      typeof value === 'string'
        ? /[\r\n]/.test(value)
        : Array.isArray(value) && value.some(v => /[\r\n]/.test(v));

    if (hasInjection) {
      console.warn(`Header injection detected: ${key}`);
      next(new Error(`Header injection detected in "${key}"`));
      return;
    }
  }
  next();
}

/**
 * 🚦 Rate limiter for cockpit-grade throughput control
 */
const cockpitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // max 30 requests per minute
  keyGenerator: (req: Request): string => {
    const userId = req.headers['x-user-id'];
    return typeof userId === 'string' && userId.length > 0 ? userId : 'unknown';
  },
  // handler signature must accept req,res,next
  handler: (_req: Request, res: Response /*, next: NextFunction */) => {
    res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      traceId: makeTraceId(),
    });
    return;
  },
});

/**
 * 🔐 Validate API key and user identity
 */
async function validateAPIKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  const key = req.headers['x-api-key'];
  const userId = req.headers['x-user-id'];
  const route = req.originalUrl;
  const vehicleId = typeof req.query.vehicleId === 'string' ? req.query.vehicleId : undefined;

  console.log(`[${new Date().toISOString()}] Route: ${route}, User: ${userId}, Vehicle: ${vehicleId}`);

  if (typeof key !== 'string' || typeof userId !== 'string') {
    res.status(400).json({
      error: 'Missing API credentials',
      code: 'MISSING_CREDENTIALS',
      traceId: makeTraceId(),
    });
    return;
  }

  try {
    const valid = await Promise.resolve(validateKey(userId, key)); // tolerate sync or async validateKey
    if (!valid) {
      res.status(403).json({
        error: 'Invalid API key',
        code: 'INVALID_API_KEY',
        traceId: makeTraceId(),
      });
      return;
    }
    next();
  } catch (err) {
    console.error('API key validation error', err);
    res.status(500).json({
      error: 'API key validation error',
      code: 'APIKEY_VALIDATION_ERROR',
      traceId: makeTraceId(),
    });
    return;
  }
}

/**
 * 🧩 Export full request pipeline
 */
export const requestPipeline = [sanitizeHeaders, cockpitLimiter, validateAPIKey];