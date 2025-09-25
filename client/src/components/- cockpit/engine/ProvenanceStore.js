// cockpit/storage/ProvenanceStore.js
import fs from 'fs';
import crypto from 'crypto';

export class ProvenanceStore {
  constructor(path = './provenance.log') {
    this.path = path;
  }

  async appendTrace(traceId, data) {
    const payload = { traceId, timestamp: new Date().toISOString(), data };
    const json = JSON.stringify(payload);
    const hash = crypto.createHash('sha256').update(json + this._lastHash()).digest('hex');
    const record = JSON.stringify({ hash, payload }) + '\n';
    await fs.promises.appendFile(this.path, record);
    return { hash, traceId };
  }

  _lastHash() {
    try {
      const content = fs.readFileSync(this.path, 'utf8').trim().split('\n').pop();
      return content ? JSON.parse(content).hash : '';
    } catch {
      return '';
    }
  }
}