// cockpit/infrastructure/CockpitAPI.ts
import express, { Request, Response } from 'express';
import { getSLAStatus, getRiskScore, getAuditLog } from './services';
import { sanitizeHeaders, cockpitLimiter, validateAPIKey } from '../middleware/RequestPipeline';
import { errorResponse, wrapResponse } from '../utils/ResponseWrapper';

const router = express.Router();

router.use(sanitizeHeaders);
router.use(cockpitLimiter);
router.use(validateAPIKey);

// GET /sla-status
router.get('/sla-status', (req: Request, res: Response) => {
  const vehicleId = req.query.vehicleId as string;
  if (!vehicleId) {
    return res.status(400).json(errorResponse('MISSING_VEHICLE_ID', 'Missing vehicleId'));
  }

  try {
    const status = getSLAStatus(vehicleId);
    res.json(wrapResponse({ vehicleId, status }));
  } catch {
    res.status(500).json(errorResponse('SLA_FETCH_FAILED', 'Failed to retrieve SLA status'));
  }
});

// GET /risk-score
router.get('/risk-score', (req: Request, res: Response) => {
  const vehicleId = req.query.vehicleId as string;
  if (!vehicleId) {
    return res.status(400).json(errorResponse('MISSING_VEHICLE_ID', 'Missing vehicleId'));
  }

  try {
    const score = getRiskScore(vehicleId);
    res.json(wrapResponse({ vehicleId, score }));
  } catch {
    res.status(500).json(errorResponse('RISK_FETCH_FAILED', 'Failed to retrieve risk score'));
  }
});

// GET /audit-log
router.get('/audit-log', (req: Request, res: Response) => {
  const vehicleId = req.query.vehicleId as string;
  if (!vehicleId) {
    return res.status(400).json(errorResponse('MISSING_VEHICLE_ID', 'Missing vehicleId'));
  }

  try {
    const log = getAuditLog(vehicleId);
    res.json(wrapResponse({ vehicleId, log }));
  } catch {
    res.status(500).json(errorResponse('AUDIT_FETCH_FAILED', 'Failed to retrieve audit log'));
  }
});

export default router;