// /core/research/researchScheduleApi.js
const express = require('express');
const Router = express.Router();
const { subscribe, unsubscribe, update, list, get } = require('./SubscriberStoreRedis');
const { apiKeyMiddleware } = require('../api/middleware/authQuota');
const Audit = require('../FleetCoreAudit');

// create subscription
Router.post('/:projectId/subscribe', apiKeyMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { email, tz = 'UTC', timeHHmm = '08:00', format = 'html' } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: 'email required' });
    const sub = await subscribe(projectId, { email, tz, timeHHmm, format });
    Audit.log('research.subscriber.added', { projectId, subscriberId: sub.id, by: req.auth });
    res.json({ ok: true, subscriber: sub });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// update subscription
Router.post('/:projectId/:subscriberId/update', apiKeyMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const sub = await update(projectId, req.params.subscriberId, req.body || {});
    if (!sub) return res.status(404).json({ ok: false, error: 'not found' });
    Audit.log('research.subscriber.updated', { projectId, subscriberId: sub.id, by: req.auth });
    res.json({ ok: true, subscriber: sub });
  } catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
});

// unsubscribe
Router.post('/:projectId/:subscriberId/unsubscribe', apiKeyMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    await unsubscribe(projectId, req.params.subscriberId);
    Audit.log('research.subscriber.removed', { projectId, subscriberId: req.params.subscriberId, by: req.auth });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
});

// list
Router.get('/:projectId/list', apiKeyMiddleware, async (req, res) => {
  try {
    const l = await list(req.params.projectId);
    res.json({ ok: true, list: l });
  } catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
});

module.exports = Router;