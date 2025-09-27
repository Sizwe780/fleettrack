function analyzeRouteComplexity(route) {
    const { terrainType, trafficScore, weatherRisk, urbanDensity } = route;
    const terrainWeight = terrainType === "mountainous" ? 1.5 : terrainType === "gravel" ? 1.3 : 1;
    const score = Math.round((trafficScore + weatherRisk + urbanDensity * terrainWeight) / 3);
    return {
      complexityScore: score,
      classification: score > 70 ? "High Complexity" : score > 40 ? "Moderate" : "Low Complexity",
    };
  }