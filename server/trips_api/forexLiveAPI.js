// core/api/forexLiveAPI.js
const express = require('express');
const Router = express.Router();
const Audit = require('../FleetCoreAudit');
const Persistence = require('../FleetCorePersistence');
const path = require('path');
const fs = require('fs');
const { apiKeyMiddleware, jwtMiddleware, quotaCheckMiddleware } = require('./middleware/authQuota');

// helper: read latest prediction files that match prefix
function loadLatestPredictions({ pair, limit = 50 } = {}) {
  const dataDir = path.resolve(__dirname, '..', 'data');
  const pfx = 'forex-pred-';
  if (!fs.existsSync(dataDir)) return [];
  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith(pfx))
    .map(f => ({ f, mtime: fs.statSync(path.join(dataDir, f)).mtimeMs }))
    .sort((a,b)=>b.mtime - a.mtime)
    .slice(0, 1000) // limit scan
    .map(x => x.f);
  const preds = [];
  for (const f of files) {
    try {
      const obj = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
      if (pair && obj.pair !== pair) continue;
      preds.push(obj);
      if (preds.length >= limit) break;
    } catch (e) {}
  }
  return preds;
}

// GET latest predictions (supports api key or jwt)
Router.get('/predictions/latest', apiKeyMiddleware, quotaCheckMiddleware({ costPerEvent: 1 }), (req, res) => {
  const pair = req.query.pair;
  const limit = parseInt(req.query.limit || '50', 10);
  const preds = loadLatestPredictions({ pair, limit });
  // billing event: count returned predictions
  try {
    Audit.log('billing.event', { user: req.auth, action: 'predictions.fetch', units: preds.length, unitType: 'prediction' });
  } catch (e) {}
  res.json({ ok: true, count: preds.length, preds });
});

// SSE subscribe endpoint: requires API key auth and per-connection quota checking
Router.get('/subscribe', apiKeyMiddleware, (req, res) => {
  // For SSE we don't call quotaCheckMiddleware per-request; instead we'll decrement quota on each event send.
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const apiKey = req.auth && req.auth.key;
  const quotaKey = apiKey || 'anon';
  const sendEvent = (entry) => {
    if (!entry || !entry.payload) return;
    // only forward 'forex.prediction' audit events
    if (entry.type !== 'forex.prediction') return;
    const q = require('./middleware/authQuota').quotaStore.get(quotaKey);
    if (q && q.used + 1 > q.limit) {
      // send quota exceeded event and close
      res.write(`event: quota_exceeded\n`);
      res.write(`data: ${JSON.stringify({ message: 'quota exceeded', resetWindow: q.window })}\n\n`);
      res.end();
      Audit.log('billing.quota.limitReached', { apiKey, window: q.window });
      Audit.off('log', onLog);
      return;
    }
    if (q) q.used += 1;
    // billing log per event (lightweight)
    try { Audit.log('billing.event', { user: req.auth, action: 'prediction.stream', units: 1, unitType: 'prediction' }); } catch(e){}
    res.write(`event: prediction\n`);
    res.write(`data: ${JSON.stringify(entry.payload)}\n\n`);
  };

  const onLog = (entry) => {
    try { sendEvent(entry); } catch (e) {}
  };

  Audit.on('log', onLog);

  // heartbeat every 15s to keep connection alive
  const hb = setInterval(() => {
    try { res.write('event: heartbeat\n'); res.write(`data: ${JSON.stringify({ ts: Date.now() })}\n\n`); } catch (e) {}
  }, 15000);

  req.on('close', () => {
    clearInterval(hb);
    Audit.off('log', onLog);
  });
});

// simple healthcheck for SSE consumers
Router.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

module.exports = Router;