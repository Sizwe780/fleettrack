import crypto from 'crypto';

export class CenturionGrid1000 {
  static domainMap = [
    'route', 'fuel', 'maintenance', 'fatigue', 'cargo',
    'enforcement', 'stolen', 'mesh', 'threat', 'traffic',
    'weather', 'audit', 'compliance', 'dispatch', 'sensor',
    'identity', 'handover', 'delay', 'anomaly', 'recovery'
  ];

  constructor(coreCount = 1000) {
    this.cores = Array.from({ length: coreCount }, (_, i) => ({
      id: `Core-${i + 1}`,
      trace: [],
      domain: CenturionGrid1000.domainMap[i % CenturionGrid1000.domainMap.length]
    }));
  }

  async runBatches(payload, options = { timeoutMs: 500 }) {
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < this.cores.length; i += batchSize) {
      const batch = this.cores.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((core, idx) =>
          this.runCore(core, payload, i + idx, options)
        )
      );
      batches.push(results.map(r =>
        r.status === 'fulfilled' ? r.value : { error: r.reason }
      ));
    }

    return batches.flat();
  }

  async runCore(core, payload, index, options) {
    const start = Date.now();
    const seed = crypto
      .createHmac('sha256', String(payload.simulationSeed || 'seed'))
      .update(core.id + index)
      .digest('hex');

    const tree = this.generateDecisionTree(payload, index, seed);
    const outcome = await this.simulate(tree, options.timeoutMs);

    const durationMs = Date.now() - start;
    const topAction = outcome[0]?.action || 'Unknown';
    const confidenceScore = outcome[0]?.score || 0;

    const record = {
      coreId: core.id,
      timestamp: new Date().toISOString(),
      seed,
      domain: tree.domain,
      domainIndex: tree.domainIndex,
      durationMs,
      topAction,
      confidenceScore,
      outcome
    };

    core.trace.push(record);
    return record;
  }

  generateDecisionTree(payload, idx, seed) {
    const domain = CenturionGrid1000.domainMap[idx % CenturionGrid1000.domainMap.length];
    const entropy = parseInt(seed.slice(0, 8), 16) % 100;

    const actions = {
      route: ['Reroute', 'Hold', 'SpeedAdjust'],
      fuel: ['RefuelStop', 'AdjustCruise', 'ReduceLoad'],
      maintenance: ['ScheduleService', 'ImmediatePullIn', 'Monitor'],
      fatigue: ['AlertDriver', 'SuggestRest', 'ReduceShift'],
      cargo: ['VerifyManifest', 'SecureLoad', 'Prioritize'],
      enforcement: ['RequestCorridor', 'SignalEnforcement', 'Delay'],
      stolen: ['Lockdown', 'Triangulate', 'NotifyEnforcement'],
      mesh: ['BroadcastIntent', 'SlowMesh', 'FormCorridor'],
      threat: ['EscalateThreat', 'IsolateNode', 'IncreaseAudit'],
      traffic: ['AlternateRoute', 'StaggerDepartures', 'SignalAdjust'],
      weather: ['Forecast', 'RerouteStorm', 'ActivateSensors'],
      audit: ['LogTrace', 'VerifyChain', 'TriggerReview'],
      compliance: ['CheckPolicy', 'FlagViolation', 'Certify'],
      dispatch: ['OptimizeLoad', 'Reschedule', 'NotifyDriver'],
      sensor: ['Calibrate', 'PingNode', 'ValidateSignal'],
      identity: ['VerifyDriver', 'CheckCredentials', 'FlagMismatch'],
      handover: ['InitiateHandover', 'ConfirmReceipt', 'SyncLogs'],
      delay: ['EstimateImpact', 'NotifyStakeholders', 'Reprioritize'],
      anomaly: ['DetectPattern', 'IsolateCause', 'Escalate'],
      recovery: ['InitiateRecovery', 'NotifyOps', 'RebootModule']
    };

    const chosen = actions[domain].map((action, i) => ({
      action,
      weight: 0.2 + ((entropy + i * 7) % 60) / 100
    }));

    return { domain, chosen, domainIndex: idx };
  }

  async simulate(tree, timeoutMs = 500) {
    await new Promise(res =>
      setTimeout(res, Math.min(timeoutMs, 25 + Math.random() * 50))
    );

    const outcomes = tree.chosen
      .map(a => ({
        action: a.action,
        score: Math.min(1, a.weight + Math.random() * 0.15)
      }))
      .sort((a, b) => b.score - a.score);

    return outcomes;
  }

  generateFeed(daysAhead = 2) {
    const feed = [];

    for (const core of this.cores) {
      const last = core.trace[core.trace.length - 1];
      if (!last) continue;

      feed.push({
        coreId: last.coreId,
        domain: last.domain,
        prediction: last.topAction,
        confidence: last.confidenceScore,
        projectedDate: new Date(Date.now() + daysAhead * 86400000).toISOString()
      });
    }

    return feed;
  }

  getDomainSummary() {
    const summary = {};

    for (const core of this.cores) {
      const last = core.trace[core.trace.length - 1];
      if (!last) continue;

      if (!summary[last.domain]) {
        summary[last.domain] = { count: 0, actions: {} };
      }

      summary[last.domain].count += 1;
      summary[last.domain].actions[last.topAction] =
        (summary[last.domain].actions[last.topAction] || 0) + 1;
    }

    return summary;
  }

  exportTrace(coreId) {
    const core = this.cores.find(c => c.id === coreId);
    if (!core) return null;

    return core.trace.map(entry => ({
      timestamp: entry.timestamp,
      domain: entry.domain,
      topAction: entry.topAction,
      confidence: entry.confidenceScore
    }));
  }

  getHighConfidencePredictions(threshold = 0.85) {
    return this.cores
      .map(core => core.trace[core.trace.length - 1])
      .filter(trace => trace && trace.confidenceScore >= threshold);
  }

  getLowConfidenceAlerts(threshold = 0.4) {
    return this.cores
      .map(core => core.trace[core.trace.length - 1])
      .filter(trace => trace && trace.confidenceScore <= threshold);
  }

  getCoreByDomain(domain) {
    return this.cores.filter(core => core.domain === domain);
  }

  getCoreTrace(coreId) {
    const core = this.cores.find(c => c.id === coreId);
    return core ? core.trace : [];
  }

  getAllTraces() {
    return this.cores.map(core => ({
      coreId: core.id,
      domain: core.domain,
      trace: core.trace
    }));
  }

  getPredictionMatrix() {
    const matrix = {};

    for (const core of this.cores) {
      const last = core.trace[core.trace.length - 1];
      if (!last) continue;

      if (!matrix[last.domain]) matrix[last.domain] = {};
      matrix[last.domain][last.topAction] =
        (matrix[last.domain][last.topAction] || 0) + 1;
    }

    return matrix;
  }

  getConfidenceDistribution() {
    const distribution = [];

    for (const core of this.cores) {
      const last = core.trace[core.trace.length - 1];
      if (!last) continue;

      distribution.push({
        coreId: last.coreId,
        domain: last.domain,
        confidence: last.confidenceScore
      });
    }

    return distribution;
  }

  getProjectedTimeline(days = 3) {
    const timeline = [];

    for (let d = 1; d <= days; d++) {
      const date = new Date(Date.now() + d * 86400000).toISOString();
      const feed = this.generateFeed(d);
      timeline.push({ date, feed });
    }

    return timeline;
  }
}