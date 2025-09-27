function analyzeProfitability(trip) {
    const { fuelUsed, tollFees, slaPenalty, cargoValue } = trip.analysis;
    const cost = fuelUsed * 0.12 + tollFees + slaPenalty;
    const netProfit = cargoValue - cost;
    return {
      netProfit: Math.round(netProfit),
      margin: `${Math.round((netProfit / cargoValue) * 100)}%`,
    };
  }