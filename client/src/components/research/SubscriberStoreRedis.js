// /core/research/SubscriberStoreRedis.js
const Redis = require('ioredis');
const Config = require('./ResearchReportConfig');

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const PREFIX = 'research:subs:'; // key per project: research:subs:<projectId>

async function subscribe(projectId, subscriber) {
  // subscriber = { id, email, tz, timeHHmm, format: 'html'|'json', active: true }
  const key = PREFIX + projectId;
  const id = subscriber.id || `s-${Date.now()}-${Math.floor(Math.random()*1e6)}`;
  const payload = Object.assign({ id, active: true, createdAt: Date.now() }, subscriber);
  await redis.hset(key, id, JSON.stringify(payload));
  return payload;
}

async function unsubscribe(projectId, subscriberId) {
  const key = PREFIX + projectId;
  await redis.hdel(key, subscriberId);
  return true;
}

async function update(projectId, subscriberId, patch) {
  const key = PREFIX + projectId;
  const raw = await redis.hget(key, subscriberId);
  if (!raw) return null;
  const cur = JSON.parse(raw);
  const updated = Object.assign(cur, patch, { updatedAt: Date.now() });
  await redis.hset(key, subscriberId, JSON.stringify(updated));
  return updated;
}

async function list(projectId) {
  const key = PREFIX + projectId;
  const all = await redis.hgetall(key);
  return Object.keys(all).map(k => JSON.parse(all[k]));
}

async function get(projectId, subscriberId) {
  const raw = await redis.hget(PREFIX + projectId, subscriberId);
  return raw ? JSON.parse(raw) : null;
}

module.exports = { subscribe, unsubscribe, update, list, get, redis };