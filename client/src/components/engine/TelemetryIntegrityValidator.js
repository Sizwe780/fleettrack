function validateTelemetry(telemetry) {
    const issues = telemetry.map((t, i) => {
      if (!t.timestamp || !t.speed || !t.location) return { index: i, issue: "Missing fields" };
      if (t.speed < 0 || t.speed > 200) return { index: i, issue: "Invalid speed" };
      if (typeof t.location !== "object") return { index: i, issue: "Corrupted location" };
      return null;
    }).filter(Boolean);
  
    return {
      totalPackets: telemetry.length,
      invalidPackets: issues.length,
      issues,
    };
  }