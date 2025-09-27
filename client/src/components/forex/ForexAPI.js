// ForexAPI.js
const express = require('express');
const Router = express.Router();
const Predictor = require('./ForexPredictor');
const Execution = require('./ForexExecution');
const Risk = require('./ForexRiskEngine');
const PaperTrader = require('./ForexPaperTrader');
const Config = require('./ForexConfig');
const Persistence = require('../FleetCorePersistence');

Router.get('/status', (req, res) => {
  res.json({ config: Config, risk: Risk.state, paperMode: Config.paperMode });
});

Router.post('/paper/run-once', async (req, res) => {
  try {
    const n = await PaperTrader.paperRunOnce();
    res.json({ ok: true, executed: n });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

Router.post('/live/enable', (req, res) => {
  // for safety: this is a single-call enable; in production you must require multi-sig / auth
  const by = req.body.by || 'unknown';
  Risk.enableLive(by);
  res.json({ ok: true, enabled: true });
});

Router.post('/live/disable', (req, res) => {
  const by = req.body.by || 'unknown';
  Risk.disableLive(by);
  res.json({ ok: true, enabled: false });
});

Router.get('/predictions/latest', (req, res) => {
  // scan persistence folder for recent preds (simple impl)
  const preds = [];
  const pfx = Config.persistencePrefix;
  const dataDir = require('path').resolve(__dirname, '..', 'data');
  const fs = require('fs');
  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter(f => f.startsWith(pfx)).slice(-100);
    files.forEach(f => {
      try {
        preds.push(JSON.parse(fs.readFileSync(require('path').join(dataDir, f), 'utf8')));
      } catch (e) {}
    });
  }
  res.json({ ok: true, count: preds.length, preds });
});

module.exports = Router;