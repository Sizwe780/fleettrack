import { Request, Response, NextFunction } from 'express';

export const snapshotListener = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalJson = res.json;

  res.json = function (body) {
    const duration = Date.now() - start;
    const traceId = `trace-${start}`;

    console.log(`[Snapshot] ${req.method} ${req.originalUrl}`);
    console.log(`TraceID: ${traceId}`);
    console.log(`User: ${req.headers['x-user-id']}`);
    console.log(`Vehicle: ${req.query.vehicleId}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Payload:`, body);

    return originalJson.call(this, body);
  };

  next();
};