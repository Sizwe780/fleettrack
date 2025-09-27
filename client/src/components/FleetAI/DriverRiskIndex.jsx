function calculateDriverRisk(driver) {
    const { fatigueLevel, incidentCount, avgRouteComplexity } = driver;
    const score = Math.round((fatigueLevel * 1.5 + incidentCount * 2 + avgRouteComplexity * 1.2) * 10);
    return {
      riskScore: score,
      status: score > 70 ? "High Risk" : score > 40 ? "Moderate" : "Low Risk",
    };
  }