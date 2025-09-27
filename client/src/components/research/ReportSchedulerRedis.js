// /core/research/ReportSchedulerRedis.js
// Schedules daily jobs by scanning subscribers and enqueuing report generation tasks.
// Uses ioredis for locks and a simple tick loop; suitable for single-leader scheduler or cluster with leader election.

const { redis } = require('./SubscriberStoreRedis');
const Persistence = require('./ResearchReportPersistence');
const Generator = require('./ResearchReportGenerator');
const Distributor = require('./ResearchReportDistributor');
const Audit = require('../FleetCoreAudit');
const Pulse = require('../FleetCorePulse');
const Config = require('./ResearchReportConfig');
const { DateTime } = require('luxon');

const SCHED_LOCK_KEY = 'research:scheduler:lock';
const LOCK_TTL_MS = 30_000;

async function acquireLock() {
  const token = `${process.pid}-${Date.now()}`;
  const ok = await redis.set(SCHED_LOCK_KEY, token, 'PX', LOCK_TTL_MS, 'NX');
  return ok ? token : null;
}

async function releaseLock(token) {
  const cur = await redis.get(SCHED_LOCK_KEY);
  if (cur === token) await redis.del(SCHED_LOCK_KEY);
}

// Enqueue for the project's daily subscribers whose time matches "now" in their timezone
async function tickEnqueue(now = Date.now(), enqueueFn) {
  // scan known projects: naive approach reads directory; for production maintain index of projects in Redis
  const projectsDir = require('path').resolve(__dirname, '..', 'data', 'research-reports');
  const fs = require('fs');
  const projects = fs.existsSync(projectsDir) ? fs.readdirSync(projectsDir) : [];
  for (const projectId of projects) {
    const subs = await (require('./SubscriberStoreRedis').list(projectId).catch(()=>[]));
    for (const s of subs) {
      if (!s.active) continue;
      try {
        // s.timeHHmm like "08:00", s.tz IANA e.g., "Africa/Johannesburg"
        const [hh, mm] = (s.timeHHmm || Config.defaultTime).split(':').map(Number);
        const dt = DateTime.fromMillis(now).setZone(s.tz || 'UTC');
        if (dt.hour === hh && dt.minute === mm) {
          // enqueue report job via provided enqueueFn(projectId, fromTs, toTs, recipients)
          const toTs = now;
          const fromTs = now - 24*60*60*1000;
          enqueueFn(projectId, fromTs, toTs, s);
        }
      } catch (e) {
        Audit.log('research.schedule.error', { projectId, subscriber: s.id, error: String(e) });
      }
    }
  }
}

// Leader loop: acquire lock then run tick every minute (drift tolerant)
let _tickInterval = null;
async function startScheduler(enqueueFn, tickIntervalMs = 60_000) {
  if (_tickInterval) return;
  _tickInterval = setInterval(async () => {
    const token = await acquireLock();
    if (!token) return; // another instance is leader
    try {
      await tickEnqueue(Date.now(), enqueueFn);
    } catch (e) {
      Audit.log('research.scheduler.tickError', { error: String(e) });
    } finally {
      await releaseLock(token);
    }
  }, tickIntervalMs);
  Pulse.inc('researchScheduler.running', 1);
}

function stopScheduler() {
  if (_tickInterval) {
    clearInterval(_tickInterval);
    _tickInterval = null;
    Pulse.inc('researchScheduler.running', -1);
  }
}

module.exports = { startScheduler, stopScheduler };