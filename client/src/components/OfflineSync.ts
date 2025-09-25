// cockpit/infrastructure/CockpitAPI.ts
import express from 'express';
import { getSLAStatus, getRiskScore, getAuditLog } from './services';
import { validateKey } from './APIKeyVault';

const router = express.Router();

// Middleware for API key validation
router.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  const userId = req.headers['x-user-id'];
  if (!validateKey(userId, key)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  next();
});

router.get('/sla-status', (req, res) => {
  const { vehicleId } = req.query;
  const status = getSLAStatus(vehicleId);
  res.json({ vehicleId, status });
});

router.get('/risk-score', (req, res) => {
  const { vehicleId } = req.query;
  const score = getRiskScore(vehicleId);
  res.json({ vehicleId, score });
});

router.get('/audit-log', (req, res) => {
  const { vehicleId } = req.query;
  const log = getAuditLog(vehicleId);
  res.json({ vehicleId, log });
});

export default router;