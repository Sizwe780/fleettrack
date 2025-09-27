// cockpit/integrations/EnforcementBridge.js
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

export class EnforcementBridgeClient {
  constructor({ baseUrl = process.env.ENFORCE_URL, key = process.env.ENFORCE_KEY } = {}) {
    this.baseUrl = baseUrl;
    this.key = key;
  }

  async requestCorridor({ traceId, payload, remedy }) {
    const token = this._sign({ traceId, issuedAt: Date.now() });
    const body = { traceId, payloadSummary: summarize(payload), remedy };
    const res = await fetch(`${this.baseUrl}/v1/request-corridor`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Corridor request failed');
    return res.json();
  }

  _sign(claims) {
    return jwt.sign(claims, this.key, { algorithm: 'RS256', expiresIn: '30s' });
  }
}

function summarize(p) {
  return { vehicleId: p.vehicleId, lat: p.location?.lat, lon: p.location?.lon };
}