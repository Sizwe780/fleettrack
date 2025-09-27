// /core/research/researchApi.js
const express = require('express');
const Router = express.Router();
const Persistence = require('./ResearchReportPersistence');
const Generator = require('./ResearchReportGenerator');
const Distributor = require('./ResearchReportDistributor');
const { apiKeyMiddleware } = require('../api/middleware/authQuota');

// list reports
Router.get('/:projectId/list', apiKeyMiddleware, (req, res) => {
  const projectId = req.params.projectId;
  const list = Persistence.listReports(projectId, 100);
  res.json({ ok: true, list });
});

// fetch single report
Router.get('/:projectId/:dateKey', apiKeyMiddleware, (req, res) => {
  const r = Persistence.loadReport(req.params.projectId, req.params.dateKey);
  if (!r) return res.status(404).json({ ok: false, error: 'not found' });
  res.json({ ok: true, report: r });
});

// trigger (ad-hoc) generation for project (admin/API key)
Router.post('/:projectId/generate', apiKeyMiddleware, async (req, res) => {
  const projectId = req.params.projectId;
  const { fromTs, toTs, notes, recipients = [] } = req.body || {};
  const now = Date.now();
  const from = fromTs || (now - 24*60*60*1000);
  const to = toTs || now;
  try {
    const report = await Generator.generateReport({ projectId, fromTs: from, toTs: to, includeHumanNotes: notes });
    // optional distribution
    if (recipients && recipients.length) {
      await Distributor.sendEmail(recipients, `Daily Research Report ${projectId} ${report.dateKey}`, require('fs').readFileSync(report.artifacts.htmlPath, 'utf8'));
    }
    res.json({ ok: true, report });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// publish latest as public artifact
Router.post('/:projectId/:dateKey/publish', apiKeyMiddleware, async (req, res) => {
  const projectId = req.params.projectId;
  const dateKey = req.params.dateKey;
  const report = Persistence.loadReport(projectId, dateKey);
  if (!report) return res.status(404).json({ ok: false, error: 'not found' });
  const pub = await Distributor.publishToEndpoint(report);
  res.json({ ok: true, published: pub });
});

module.exports = Router;