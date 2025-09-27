// core/api/middleware/authQuota.js
// Simple JWT + API key auth skeleton and per-key quota middleware.
// Replace JWT secret and Redis hooks for production.

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// in-memory quota store; in prod replace with Redis
const quotaStore = new Map();
// default quota: 1000 events per hour
const DEFAULT_HOURLY_QUOTA = parseInt(process.env.DEFAULT_HOURLY_QUOTA || '1000', 10);

function nowHourKey() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

function ensureKeyData(apiKey) {
  if (!quotaStore.has(apiKey)) {
    quotaStore.set(apiKey, { window: nowHourKey(), used: 0, limit: DEFAULT_HOURLY_QUOTA });
  }
  const o = quotaStore.get(apiKey);
  if (o.window !== nowHourKey()) {
    o.window = nowHourKey();
    o.used = 0;
  }
  return o;
}

// API key middleware: client provides x-api-key header
async function apiKeyMiddleware(req, res, next) {
  const key = (req.headers['x-api-key'] || '').trim();
  if (!key) return res.status(401).json({ error: 'api key required' });
  // dev: accept any non-empty key; production: validate against DB
  req.auth = { type: 'apiKey', key, scopes: ['forex.read'] };
  // attach quota object
  req.quota = ensureKeyData(key);
  next();
}

// JWT middleware: Authorization: Bearer <token>
async function jwtMiddleware(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const m = auth.match(/^Bearer (.+)$/i);
  if (!m) return res.status(401).json({ error: 'bearer token required' });
  try {
    const payload = jwt.verify(m[1], SECRET);
    // payload should include scopes and sub
    req.auth = { type: 'jwt', user: payload.sub, scopes: payload.scopes || [] };
    // use sub as quota key
    req.quota = ensureKeyData(payload.sub || 'anon');
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// quota middleware: checks and increments per prediction event consumed
function quotaCheckMiddleware({ costPerEvent = 1 } = {}) {
  return (req, res, next) => {
    const q = req.quota;
    if (!q) return res.status(403).json({ error: 'no quota context' });
    if (q.used + costPerEvent > q.limit) {
      res.set('X-RateLimit-Limit', String(q.limit));
      res.set('X-RateLimit-Remaining', String(Math.max(0, q.limit - q.used)));
      return res.status(429).json({ error: 'quota exceeded', resetWindow: q.window });
    }
    q.used += costPerEvent;
    res.set('X-RateLimit-Limit', String(q.limit));
    res.set('X-RateLimit-Remaining', String(Math.max(0, q.limit - q.used)));
    next();
  };
}

module.exports = { apiKeyMiddleware, jwtMiddleware, quotaCheckMiddleware, quotaStore };