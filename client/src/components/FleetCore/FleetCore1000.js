// FleetCore1000.js
const ProcessManager = require('./ProcessManager');
const FleetCoreScheduler = require('./FleetCoreScheduler');
const Neural = require('./FleetCoreNeural');
const Audit = require('./FleetCoreAudit');
const Pulse = require('./FleetCorePulse');

class FleetCore1000 {
  constructor({ targetConcurrency = 1000, logger = console, researchShare = 0.30 } = {}) {
    this.targetConcurrency = targetConcurrency;
    this.logger = logger;

    this.scheduler = new FleetCoreScheduler();

    // process manager created first so we can base reservations on its concurrency
    this.pm = new ProcessManager({
      concurrency: Math.min(200, Math.max(10, Math.floor(this.targetConcurrency / 5))), // safe default
      onTaskStart: meta => {
        Pulse.inc('activeProcesses', 1);
        Pulse.inc('throughput', 1);
        if (meta && meta.type === 'research') {
          this._runningResearchCount = (this._runningResearchCount || 0) + 1;
          Pulse.set('runningResearch', this._runningResearchCount);
        }
      },
      onTaskFinish: (meta, err) => {
        Pulse.inc('activeProcesses', -1);
        if (err) Pulse.inc('errors', 1);
        if (meta && meta.type === 'research') {
          this._runningResearchCount = Math.max(0, (this._runningResearchCount || 0) - 1);
          Pulse.set('runningResearch', this._runningResearchCount);
        }
      },
      logger
    });

    // research reservation settings
    this.researchShare = researchShare;
    this._researchReserved = Math.max(1, Math.floor(this.pm.concurrency * this.researchShare));
    Pulse.set('researchReserved', this._researchReserved);

    // runtime state
    this.running = false;
    this._pumpInterval = null;
    this._researchDaemon = null;
    this._forexInterval = null;
    this._runningResearchCount = 0;
  }

  startPump(intervalMs = 50) {
    if (this.running) return;
    this.running = true;
    this._pumpInterval = setInterval(() => this._pump(), intervalMs);
    // start research daemon alongside pump
    this.startResearchDaemon();
    // start forex submit loop (uses ForexConfig.predictionIntervalMs)
    try {
      const Config = require('./forex/ForexConfig');
      if (!this._forexInterval) {
        this._forexInterval = setInterval(async () => {
          try {
            this.submitTask({ type: 'research', priority: 2, payload: { category: 'forex', dataBundle: null, runForex: true } });
          } catch (e) {
            this.logger && this.logger.warn('forex submit failed', e);
          }
        }, Config.predictionIntervalMs || 10000);
      }
    } catch (e) {
      // forex module may not be present; log and continue
      this.logger && this.logger.debug && this.logger.debug('ForexConfig not available, forex loop not started');
    }
  }

  stopPump() {
    if (!this.running) return;
    clearInterval(this._pumpInterval);
    this._pumpInterval = null;
    this.running = false;
    this.stopResearchDaemon();
    if (this._forexInterval) {
      clearInterval(this._forexInterval);
      this._forexInterval = null;
    }
  }

  // research daemon: ensure the scheduler has research tasks up to reserved capacity
  startResearchDaemon(intervalMs = 5000) {
    if (this._researchDaemon) return;
    this._researchDaemon = setInterval(() => {
      try {
        const queuedResearch = (this.scheduler.queue || []).filter(t => t.type === 'research').length;
        const runningResearch = this._runningResearchCount || 0;
        const reserved = this._researchReserved || Math.max(1, Math.floor(this.pm.concurrency * this.researchShare));
        Pulse.set('researchQueued', queuedResearch);
        if (runningResearch + queuedResearch < reserved) {
          // enqueue a research task with lower priority (so it won't starve urgent tasks)
          this.submitTask({
            type: 'research',
            priority: 2,
            creditWeight: 0,
            payload: { category: 'research.global', sources: ['global_feeds'] }
          });
        }
      } catch (e) {
        this.logger && this.logger.warn('research daemon tick failed', e);
      }
    }, intervalMs);
  }

  stopResearchDaemon() {
    if (!this._researchDaemon) return;
    clearInterval(this._researchDaemon);
    this._researchDaemon = null;
  }

  _canScheduleTaskOfType(nextType) {
    const running = this.pm.running || 0;
    const reserved = this._researchReserved || Math.max(1, Math.floor(this.pm.concurrency * this.researchShare));
    const runningResearch = this._runningResearchCount || 0;

    if (nextType === 'research') {
      // allow research only if runningResearch < reserved and there is free worker capacity
      return runningResearch < reserved && running < this.pm.concurrency;
    } else {
      // for non-research, ensure we don't consume slots that should be available for research
      // calculate available for non-research = totalConcurrency - max(0, reserved - runningResearch)
      const reservedShortfall = Math.max(0, reserved - runningResearch);
      const availableForNonResearch = this.pm.concurrency - reservedShortfall;
      return running < availableForNonResearch;
    }
  }

  _pump() {
    try {
      // attempt to schedule tasks while capacity exists
      while (this.scheduler.size() > 0 && this.pm.running < this.pm.concurrency) {
        const next = this.scheduler.peek();
        if (!next) break;

        // enforce reservation logic
        if (!this._canScheduleTaskOfType(next.type)) break;

        const task = this.scheduler.pop();
        if (!task) break;

        // wrapper uses task.type for meta so ProcessManager's hooks can track research counts
        const wrapper = async () => {
          const start = Date.now();
          try {
            let res;
            switch (task.type) {
              case 'predict':
                if (Neural.ExponentialSmoother && task.payload && task.payload.series) {
                  const s = new Neural.ExponentialSmoother(task.payload.alpha || 0.3);
                  task.payload.series.forEach(v => s.update(v));
                  res = { forecast: s.forecast(task.payload.steps || 1) };
                } else {
                  res = { ok: false, reason: 'no-series' };
                }
                break;
              case 'simulate':
                res = await Neural.runSimulation(task.payload);
                break;
              case 'mentorMatch':
                res = await Neural.matchMentors(task.payload);
                break;
              case 'publish':
                res = await Neural.predictPublishQuality(task.payload);
                break;
              case 'growthTrack':
                res = await Neural.trackGrowth(task.payload);
                break;
              case 'research':
                // research handler: ensemble forecasts + MC + optional lightweight retrain
                res = await this._handleResearch(task.payload);
                break;
              default:
                res = { ok: false, reason: 'unknown' };
            }

            Audit.log('task.complete', { id: task.id, type: task.type, result: res });
            Pulse.set('latencyMs', Date.now() - start);
            return { ok: true, result: res };
          } catch (err) {
            Audit.log('task.error', { id: task.id, type: task.type, error: String(err) });
            throw err;
          }
        };

        // submit wrapper to process manager, include meta.type for hooks
        this.pm.submit(wrapper, { taskId: task.id, type: task.type })
          .catch(err => this.logger.error('task failed', task.id, err));
      }

      // emit snapshot for UI/observability
      Pulse.emit('snapshot', Pulse.snapshot());
    } catch (err) {
      this.logger.error('FleetCore1000 _pump error', err);
      Pulse.inc('errors', 1);
    }
  }

  async _handleResearch(payload = {}) {
    // lightweight research pipeline: fetch/preprocess -> ensemble forecasts -> MC sim -> persist + emit
    try {
      // simple data acquisition: accept provided bundle or use no-op placeholder
      const data = payload.dataBundle || { series: payload.series || [], meta: { sources: payload.sources || [] } };
      // summary
      const series = Array.isArray(data.series) ? data.series : [];
      const smoother = new Neural.ExponentialSmoother(payload.alpha || 0.25);
      series.forEach(v => smoother.update(v));
      const forecast = smoother.forecast(payload.steps || 3);

      // Monte Carlo synthetic exploration if agents provided
      const mc = (payload.syntheticAgents && payload.syntheticAgents.length)
        ? await Neural.runSimulation({ agents: payload.syntheticAgents, env: payload.env || {}, steps: payload.steps || 20, rollouts: payload.rollouts || 100 })
        : [];

      const prediction = {
        id: `research-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        ts: Date.now(),
        category: payload.category || 'research.global',
        inputsSummary: { seriesLength: series.length, sources: (data.meta && data.meta.sources) || [] },
        predictions: [
          { type: 'forecast', value: forecast, confidence: 0.6 },
          { type: 'mc_sim', value: mc, confidence: mc.length ? 0.5 : 0 }
        ],
        confidence: 0.55,
        provenance: { sources: (data.meta && data.meta.sources) || [], handler: 'research', engineVersion: 'FleetCore1000-v1' },
        modelVersion: Neural.__getOnlineModel ? Neural.__getOnlineModel().dims : 'v1'
      };

      // persist prediction snapshot (uses FleetCorePersistence via Audit or separate persistence)
      Audit.log('research.prediction', prediction);
      Pulse.inc('researchProduced', 1);

      // optional: lightweight online model update if labels are provided (deferred to other flows)
      return { ok: true, prediction };
    } catch (err) {
      Audit.log('research.error', { error: String(err), payload });
      Pulse.inc('errors', 1);
      return { ok: false, error: String(err) };
    }
  }

  submitTask(task) {
    const t = Object.assign(
      {
        id: task.id || `t-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        type: task.type || 'generic',
        priority: typeof task.priority === 'number' ? task.priority : 5,
        creditWeight: typeof task.creditWeight === 'number' ? task.creditWeight : 0,
        payload: task.payload || {},
        createdAt: Date.now(),
        attempts: 0
      },
      task
    );

    this.scheduler.push(t);

    try {
      const AuditLocal = require('./FleetCoreAudit');
      AuditLocal.log('task.submitted', { taskId: t.id, type: t.type, priority: t.priority });
    } catch (e) {
      this.logger && this.logger.warn('Audit log failed for task.submit', e);
    }

    // track research queue metric
    if (t.type === 'research') {
      const queuedResearch = (this.scheduler.queue || []).filter(q => q.type === 'research').length;
      Pulse.set('researchQueued', queuedResearch);
    }

    Pulse.inc('throughput', 1);
    return t.id;
  }

  status() {
    return {
      schedulerSize: this.scheduler.size(),
      pmStatus: this.pm.status ? this.pm.status() : { concurrency: this.pm.concurrency, running: this.pm.running || 0, queued: 0 },
      pulse: Pulse.snapshot(),
      research: {
        reserved: this._researchReserved,
        running: this._runningResearchCount || 0,
        queued: (this.scheduler.queue || []).filter(t => t.type === 'research').length
      }
    };
  }
}

module.exports = FleetCore1000;