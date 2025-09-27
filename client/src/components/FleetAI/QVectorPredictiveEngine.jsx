function predictTripOutcome(trip) {
    const { distance, terrainType, weatherRisk, driverFatigue, slaMinutes } = trip.analysis;
    const riskFactor = (weatherRisk + driverFatigue + (terrainType === "mountainous" ? 1.2 : 1)) * 0.8;
    const breachLikelihood = Math.min(100, Math.round(riskFactor * distance / slaMinutes * 10));
    const fuelCost = Math.round(distance * 0.12 * (terrainType === "urban" ? 1 : 1.3));
    const profitForecast = trip.analysis?.profitability?.baseProfit - fuelCost;
  
    return {
      breachLikelihood: `${breachLikelihood}%`,
      fuelCost: `R${fuelCost}`,
      profitForecast: `R${profitForecast}`,
    };
  }