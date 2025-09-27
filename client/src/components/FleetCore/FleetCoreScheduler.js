// FleetCoreScheduler.js
// Priority scheduler with credit-weighted fairness and starvation avoidance.
// Task shape: { id, type, priority, creditWeight, payload }

const { EventEmitter } = require('events');

class FleetCoreScheduler extends EventEmitter {
  constructor({ starvationThreshold = 30000 } = {}) {
    super();
    this.queue = []; // simple array used as heap; keep small per tick
    this.lastDequeued = new Map();
    this.starvationThreshold = starvationThreshold;
  }

  push(task) {
    // Normalize
    const t = Object.assign({ createdAt: Date.now(), attempts: 0 }, task);
    this.queue.push(t);
    this._sort();
    this.emit('push', t);
  }

  _sort() {
    // sort by (priority desc, creditWeight desc, createdAt asc)
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if ((b.creditWeight || 0) !== (a.creditWeight || 0)) return (b.creditWeight || 0) - (a.creditWeight || 0);
      return a.createdAt - b.createdAt;
    });
  }

  pop() {
    // Starvation protection: if oldest item older than threshold, escalate
    const now = Date.now();
    let candidateIndex = 0;
    for (let i = 0; i < this.queue.length; i++) {
      const t = this.queue[i];
      if (now - t.createdAt > this.starvationThreshold) {
        candidateIndex = i;
        break;
      }
    }
    const task = this.queue.splice(candidateIndex, 1)[0];
    if (task) {
      this.lastDequeued.set(task.id, Date.now());
      this.emit('pop', task);
    }
    return task;
  }

  size() {
    return this.queue.length;
  }

  peek() {
    return this.queue[0];
  }

  drain() {
    const arr = this.queue.slice();
    this.queue = [];
    return arr;
  }
}

module.exports = FleetCoreScheduler;