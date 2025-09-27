// src/middleware/requestPipeline.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { validateKey } from '../infrastructure/APIKeyVault';

/** helper for trace ids */
const makeTraceId = () => `trace-${Date.now()}`;

/**
 * 🛡️ Sanitize incoming headers to prevent injection
 */
export const sanitizeHeaders: RequestHandler = (req, _res, next) => {
  for (const key of Object.keys(req.headers)) {
    const value = req.headers[key];
    const hasInjection =
      (typeof value === 'string' && /[\r\n]/.test(value)) ||
      (Array.isArray(value) && value.some(v => /[\r\n]/.test(v)));
    if (hasInjection) {
      console.warn(`Header injection detected in "${key}"`);
      // pass an Error to next() (express will handle)
      next(new Error(`Header injection detected in "${key}"`));
      return;
    }
  }
  next();
};

/**
 * 🚦 Rate limiter for cockpit-grade control
 */
export const cockpitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 requests per minute
  keyGenerator: (req: Request): string => {
    const userId = req.headers['x-user-id'];
    return typeof userId === 'string' && userId.length > 0 ? userId : 'unknown';
  },
  // handler signature: (req, res, next)
  handler: (_req: Request, res: Response /*, next: NextFunction */) => {
    res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      traceId: makeTraceId(),
    });
  },
});

/**
 * 🔐 Validate API key and user identity
 *
 * Note: async because validateKey may be async (DB/secret manager).
 */
export const validateAPIKey: RequestHandler = async (req, res, next) => {
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
    const ok = await validateKey(userId, key);
    if (!ok) {
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
};