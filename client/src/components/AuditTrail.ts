export const logEvent = (type: string, payload: object) => {
    const timestamp = new Date().toISOString();
    const entry = { type, payload, timestamp };
    // Push to blockchain or secure log store
  };