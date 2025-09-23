export default function evaluateTripRisk(trip) {
    const flags = [];
  
    if ((trip.healthScore ?? 100) < 50) flags.push('Low health score');
    if ((trip.analysis?.profitability?.netProfit ?? 0) < 100) flags.push('Low profit');
    if (!trip.breakTaken) flags.push('No break taken');
    if (!Array.isArray(trip.statusHistory) || trip.statusHistory.length < 2) flags.push('Incomplete status history');
    if (Array.isArray(trip.coordinates) && trip.coordinates.length < 3) flags.push('Insufficient route data');
  
    return {
      shouldFlag: flags.length > 0,
      reasons: flags
    };
  }