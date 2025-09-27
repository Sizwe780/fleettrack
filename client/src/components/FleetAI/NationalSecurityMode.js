function secureTripLog(trip) {
    const payload = JSON.stringify(trip);
    const hash = crypto.createHash("sha256").update(payload).digest("hex");
    return {
      encryptedLog: btoa(payload),
      auditHash: hash,
      overrideCode: `CMD-${trip.id.slice(0, 6).toUpperCase()}-${Date.now()}`,
    };
  }