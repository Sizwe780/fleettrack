function suggestDriver(drivers, route) {
    const complexity = analyzeRouteComplexity(route).complexityScore;
    const candidates = drivers.filter(d => calculateDriverRisk(d).status === "Low Risk");
    const sorted = candidates.sort((a, b) => estimateFatigue(a).fatigueLevel - estimateFatigue(b).fatigueLevel);
    return sorted[0]?.name ?? "Fallback Driver";
  }