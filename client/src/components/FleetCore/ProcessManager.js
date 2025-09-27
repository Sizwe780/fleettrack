// ProcessManager.js
// Worker-pool like pattern using async task runners (no heavy OS threads assumed).
// Configure concurrency; can be backed by worker_threads, containers, or serverless invocations.

class ProcessManager {
    constructor({ concurrency = 100, onTaskStart = () => {}, onTaskFinish = () => {}, logger = console }) {
      this.concurrency = concurrency;
      this.onTaskStart = onTaskStart;
      this.onTaskFinish = onTaskFinish;
      this.logger = logger;
      this.running = 0;
      this.queue = [];
      this.stopped = false;
    }
  
    submit(taskFn, meta = {}) {
      return new Promise((resolve, reject) => {
        const item = { taskFn, meta, resolve, reject };
        this.queue.push(item);
        this._tick();
      });
    }
  
    _tick() {
      if (this.stopped) return;
      while (this.running < this.concurrency && this.queue.length > 0) {
        const item = this.queue.shift();
        this.running++;
        try {
          this.onTaskStart(item.meta);
          Promise.resolve().then(() => item.taskFn())
            .then(result => {
              this.running--;
              this.onTaskFinish(item.meta, null, result);
              item.resolve(result);
              this._tick();
            })
            .catch(err => {
              this.running--;
              this.onTaskFinish(item.meta, err);
              item.reject(err);
              this._tick();
            });
        } catch (err) {
          this.running--;
          this.onTaskFinish(item.meta, err);
          item.reject(err);
        }
      }
    }
  
    stop() {
      this.stopped = true;
    }
  
    setConcurrency(n) {
      this.concurrency = n;
      this._tick();
    }
  
    status() {
      return { concurrency: this.concurrency, running: this.running, queued: this.queue.length };
    }
  }
  
  module.exports = ProcessManager;