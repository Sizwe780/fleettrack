// FleetCoreAPI.js
// Minimal Express server exposing task submission endpoints and status.

const express = require('express');
const bodyParser = require('body-parser');
const FleetCore1000 = require('./FleetCore1000');
const Persistence = require('./FleetCorePersistence');
const ModelPersist = require('./ModelPersistence');

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

const engine = new FleetCore1000({ targetConcurrency: 1000, logger: console });
engine.startPump(30);

// restore model if present
ModelPersist.restoreModel();

// endpoints
app.post('/api/task', (req, res) => {
  const { type, priority = 5, creditWeight = 0, payload = {} } = req.body;
  if (!type) return res.status(400).json({ error: 'type required' });
  const id = engine.submitTask({ type, priority, creditWeight, payload });
  return res.status(202).json({ taskId: id });
});

app.get('/api/status', (req, res) => {
  return res.json(engine.status());
});

app.post('/api/snapshot-model', (req, res) => {
  try {
    ModelPersist.snapshotModel();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get('/api/pulse', (req, res) => {
  const Pulse = require('./FleetCorePulse');
  return res.json(Pulse.snapshot());
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`FleetCore API running on ${PORT}`));
module.exports = app;