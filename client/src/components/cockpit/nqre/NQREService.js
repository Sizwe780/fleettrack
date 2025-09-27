// cockpit/nqre/NQREService.js
import express from 'express';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import { EnforcementBridgeMock } from '../integrations/EnforcementBridgeMock.js';
import { ProvenanceStore } from '../storage/ProvenanceStore.js';

// Simple Centurion replica to simulate outcomes (10 cores)
class CenturionReplica {
  constructor(coreCount = 10) {
    this.cores = Array.from({ length: coreCount }, (_, i) => ({ id: `rCore-${i+1}` }));
  }

  async runSimulations(payload) {
    const tasks = this.cores.map((c, idx) => this.runCore(c, payload, idx));
    const results = await Promise.all(tasks);
    return results;
  }

  async runCore(core, payload, idx) {
    // fast simulated compute; replace with real model/WASM later
    await new Promise(r => setTimeout(r, 10 + Math.random() * 40));
    const score = Math.min(1, (Math.random() * 0.3) + (payload.severity || 0) * 0.1);
    return { coreId: core.id, score, recommendedAction: score > 0.5 ? 'RequestCorridor' : 'MeshSlow' };
  }
}

// Minimal responder ETA estimator (mocked)
function estimateETA(responder, incident) {
  const distKm = haversineKm(responder.pos, incident.pos);
  const baseSpeedKph = responder.mode === 'air' ? 250 : 40; // rough
  const etaMin = (distKm / baseSpeedKph) * 60;
  // factor in traffic multiplier
  const trafficFactor = incident.trafficMultiplier || 1.0;
  return Math.max(1, Math.round(etaMin * trafficFactor));
}

function capabilityScore(responder, incident) {
  // basic capability scoring: equipment match + readiness
  let score = 0.2;
  if (responder.capabilities.includes(incident.requiredCapability)) score += 0.5;
  score += (responder.readiness || 0.5) * 0.3;
  return Math.min(1, Number(score.toFixed(2)));
}

function haversineKm(a, b) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const s = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}

// In-memory responder registry (replace with live service)
const responderRegistry = [
  { id: 'R1', pos: { lat: -33.96, lon: 25.61 }, mode: 'ground', capabilities: ['medical','tactical'], readiness: 0.9 },
  { id: 'R2', pos: { lat: -33.94, lon: 25.60 }, mode: 'ground', capabilities: ['fire','medical'], readiness: 0.7 },
  { id: 'R3', pos: { lat: -33.95, lon: 25.63 }, mode: 'air', capabilities: ['aerial'], readiness: 0.95 }
];

const enforcement = new EnforcementBridgeMock();
const prov = new ProvenanceStore(); // default path ./provenance.log
const centurion = new CenturionReplica(10);

const app = express();
app.use(bodyParser.json());

app.post('/api/nqre/dispatch', async (req, res) => {
  try {
    const incident = req.body;
    if (!incident || !incident.pos) return res.status(400).json({ error: 'invalid incident' });

    const traceId = crypto.randomUUID();
    // 1) discover nearby responders
    const candidates = responderRegistry
      .map(r => {
        const eta = estimateETA(r, incident);
        const cap = capabilityScore(r, incident);
        return { responder: r, etaMin: eta, capability: cap, utility: (1/eta)*0.6 + cap*0.4 };
      })
      .filter(c => c.etaMin <= (incident.maxAcceptableEta || 30)) // filter distant
      .sort((a,b) => b.utility - a.utility);

    // 2) run Centurion replica to test robustness of corridor requests
    const simPayload = { incident, candidates, severity: incident.severity || 1 };
    const simResults = await centurion.runSimulations(simPayload);

    // 3) select top responder and decide action
    const selected = candidates[0];
    const recommended = simResults.some(s => s.recommendedAction === 'RequestCorridor') ? 'RequestCorridor' : 'MeshSlow';

    // 4) if corridor requested, call EnforcementBridge (mock)
    let corridorResponse = null;
    if (recommended === 'RequestCorridor' && selected) {
      corridorResponse = await enforcement.requestCorridor({ traceId, incident, responderId: selected.responder.id });
    }

    // 5) prepare directives: mesh broadcast + cockpit instruction
    const directives = {
      toResponder: { id: selected?.responder.id, etaMin: selected?.etaMin },
      meshCommand: { type: recommended === 'RequestCorridor' ? 'FORM_CORRIDOR' : 'SLOW_MESH', traceId },
      cockpit: { message: `Responder ${selected?.responder.id} en route, ETA ${selected?.etaMin}min`, traceId }
    };

    // 6) persist provenance (hash-linked)
    await prov.appendTrace(traceId, { incident, candidates, simResults, selected: selected?.responder?.id, directives, corridorResponse });

    return res.json({ traceId, directives, selected: selected?.responder, corridorResponse });
  } catch (err) {
    console.error('dispatch error', err);
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/api/nqre/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`NQRE service listening on ${port}`));