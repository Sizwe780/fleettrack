// cockpit/integrations/EnforcementBridgeMock.js
export class EnforcementBridgeMock {
    constructor() {}
    async requestCorridor({ traceId, incident, responderId }) {
      // simulate authorization handshake and corridor grant
      await new Promise(r => setTimeout(r, 50));
      return { granted: true, corridorId: `corr-${traceId.slice(0,8)}`, etaAdjustmentMin: -2 };
    }
  }