import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { validateKey } from '../infrastructure/APIKeyVault';

export const sanitizeHeaders = (req: Request, _: Response, next: NextFunction) => {
  for (const key in req.headers) {
    const value = req.headers[key];
    if (typeof value === 'string' && /[\r\n]/.test(value)) {
      return next(new Error('Header injection detected'));
    }
  }
  next();
};

export const cockpitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.headers['x-user-id'] || 'unknown',
  handler: (_, res) => {
    res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      traceId: `trace-${Date.now()}`
    });
  }
});

export const validateAPIKey = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-api-key'] as string;
  const userId = req.headers['x-user-id'] as string;
  const route = req.originalUrl;
  const vehicleId = req.query.vehicleId;

  console.log(`[${new Date().toISOString()}] Route: ${route}, User: ${userId}, Vehicle: ${vehicleId}`);

  if (!key || !userId) {
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
};