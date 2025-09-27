function clusterTrips(trips) {
    const clusters = { lowRisk: [], mediumRisk: [], highRisk: [] };
    trips.forEach(trip => {
      const risk = trip.analysis?.riskLevel ?? "medium";
      clusters[risk === "low" ? "lowRisk" : risk === "high" ? "highRisk" : "mediumRisk"].push(trip);
    });
    return clusters;
  }