function batchPredictSLABreach(trips) {
    return trips.map(trip => {
      const { eta, slaMinutes, trafficScore, weatherRisk } = trip.analysis;
      const delayFactor = trafficScore * 0.6 + weatherRisk * 0.4;
      const breachChance = Math.round((delayFactor / slaMinutes) * 100);
      return {
        tripId: trip.id,
        breachLikelihood: `${Math.min(breachChance, 100)}%`,
      };
    });
  }