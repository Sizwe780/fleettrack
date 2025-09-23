function calculateFleetHealth(trips) {
    const totalTrips = trips.length;
    const avgHealthScore = trips.reduce((sum, t) => sum + (t.healthScore || 0), 0) / totalTrips;
    const criticalCount = trips.filter(t => t.status === 'critical').length;
    const violationTotal = trips.reduce((sum, t) => sum + (t.driverStats?.violationCount || 0), 0);
  
    return {
      totalTrips,
      avgHealthScore: Math.round(avgHealthScore),
      criticalRate: Math.round((criticalCount / totalTrips) * 100),
      totalViolations: violationTotal
    };
  }