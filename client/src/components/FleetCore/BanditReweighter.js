// BanditReweighter.js
// Lightweight Gaussian-UCB orchestrator for strategy/model allocation.
// Usage: const b = new BanditReweighter(); b.select(models); b.update(modelId, reward);

class BanditReweighter {
    constructor({ c = 2 } = {}) {
      this.counts = new Map(); // modelId -> n
      this.sum = new Map(); // modelId -> sum rewards
      this.sumSq = new Map(); // modelId -> sum squares
      this.c = c;
      this.total = 0;
    }
  
    ensure(modelId) {
      if (!this.counts.has(modelId)) {
        this.counts.set(modelId, 0);
        this.sum.set(modelId, 0);
        this.sumSq.set(modelId, 0);
      }
    }
  
    observe(modelId, reward) {
      this.ensure(modelId);
      this.counts.set(modelId, this.counts.get(modelId) + 1);
      this.sum.set(modelId, this.sum.get(modelId) + reward);
      this.sumSq.set(modelId, this.sumSq.get(modelId) + reward * reward);
      this.total++;
    }
  
    score(modelId) {
      this.ensure(modelId);
      const n = this.counts.get(modelId);
      if (n === 0) return Infinity; // force exploration
      const mean = this.sum.get(modelId) / n;
      const variance = Math.max(1e-4, (this.sumSq.get(modelId) / n) - mean * mean);
      const bonus = this.c * Math.sqrt((2 * Math.log(this.total + 1)) / n) * Math.sqrt(variance + 1e-8);
      return mean + bonus;
    }
  
    // return a map of modelId -> score normalized to positive weights
    scoresFor(models = []) {
      const sc = {};
      models.forEach(m => {
        sc[m] = this.score(m);
      });
      // normalize to positive scale (shift-min)
      const vals = Object.values(sc).map(v => (isFinite(v) ? v : 0));
      const min = Math.min(...vals);
      let shifted = {};
      Object.keys(sc).forEach(k => {
        const v = sc[k];
        const s = (isFinite(v) ? v : 0) - min + 1e-6;
        shifted[k] = s;
      });
      return shifted;
    }
  
    // choose top-k models or return distribution
    select(models = [], { k = 1 } = {}) {
      const sc = this.scoresFor(models);
      const arr = Object.keys(sc).map(km => ({ modelId: km, score: sc[km] }));
      arr.sort((a, b) => b.score - a.score);
      return arr.slice(0, k).map(a => a.modelId);
    }
  }
  
  module.exports = BanditReweighter;