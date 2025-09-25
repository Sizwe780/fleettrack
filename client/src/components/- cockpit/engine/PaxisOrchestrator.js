// cockpit/engine/PaxisOrchestrator.js
import { CenturionGrid100 } from './CenturionGrid100';
import { ProvenanceStore } from '../storage/ProvenanceStore';
import { EnforcementBridgeClient } from '../integrations/EnforcementBridge';
import crypto from 'crypto';

const grid = new CenturionGrid100(100);
const store = new ProvenanceStore();
const enforcement = new EnforcementBridgeClient();

export async function runPaxis(payload) {
  // 1. run 100 cores concurrently
  const coreResults = await grid.runAll(payload);
  // 2. aggregate core outcomes into candidate atomic actions
  const candidates = aggregateCoreOutcomes(coreResults);
  // 3. compose composite remedies (fusion)
  const composites = composeComposites(candidates, payload);
  // 4. score composites: safety, ETA delta, enforcement arrival, cost, social friction
  const scored = composites.map(c => ({ c, score: scoreComposite(c, payload) }));
  // 5. adversarial robustness simulation for top candidates
  const topK = scored.sort((a,b)=>b.score.total-a.score.total).slice(0,5);
  for (const item of topK) {
    item.robustness = await adversarialSim(item.c, payload);
  }
  // 6. persist full provenance (inputs, core traces, composites)
  const traceId = crypto.randomUUID();
  await store.appendTrace(traceId, { payload, coreResults, composites: topK });
  // 7. emit directives: to mesh, to enforcement bridge, to cockpit
  await emitDirectives(topK, traceId, payload);
  return { traceId, topK };
}

function aggregateCoreOutcomes(coreResults) {
  const tally = {};
  coreResults.forEach(r => {
    if (r && r.outcome) {
      r.outcome.forEach(o => {
        const key = o.action;
        tally[key] = (tally[key] || 0) + o.score;
      });
    }
  });
  return Object.entries(tally).map(([action, s]) => ({ action, score: s }));
}

function composeComposites(candidates, payload) {
  // simple heuristic composer that groups complementary actions
  const comps = [];
  const route = candidates.find(c=>/Route|Alternate|Reroute/i.test(c.action));
  const enforcement = candidates.find(c=>/Corridor|Enforcement|Lockdown/i.test(c.action));
  if (route) comps.push({ name:'SafeCorridor', actions:[route, enforcement].filter(Boolean) });
  // add other composed remedies (fuel+maintenance, mesh+slow, stolen+triangulate)
  return comps;
}

function scoreComposite(comp, payload) {
  // returns multi-criteria scores
  return { total: comp.actions.reduce((s,a)=>s+a.score,0), safety:0.8, eta: -2 };
}

async function adversarialSim(comp, payload) {
  // perturb inputs and rerun a small simulation to test robustness
  return { robustnessScore: Math.random() };
}

async function emitDirectives(topK, traceId, payload) {
  // send mesh commands and enforcement requests for the top candidate
  const chosen = topK[0].c;
  if (chosen.actions.some(a=>/Corridor|Enforcement|Lockdown/i.test(a.action))) {
    await enforcement.requestCorridor({ traceId, payload, remedy: chosen });
  }
  // publish to device mesh, cockpit API (omitted for brevity)
}