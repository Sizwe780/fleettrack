export function calculateTCO({ trips, invoices, penalties, driverScores }: {
    trips: any[],
    invoices: any[],
    penalties: any[],
    driverScores: any[]
  }) {
    const fuel = trips.reduce((sum, trip) => sum + (trip.fuelCost || 0), 0);
    const maintenance = invoices.reduce((sum, inv) =>
      sum + (inv.items || []).filter(i => i.type === 'maintenance').reduce((s, i) => s + i.amount, 0), 0);
    const penaltyTotal = penalties.reduce((sum, p) => sum + (p.amount || 0), 0);
    const behaviorCost = driverScores.reduce((sum, score) => sum + (100 - score.score), 0);
  
    const totalCost = fuel + maintenance + penaltyTotal + behaviorCost;
  
    return {
      fuel,
      maintenance,
      penalties: penaltyTotal,
      behavior: behaviorCost,
      totalCost,
      certId: `TCO-${Date.now()}`,
      logoUrl: '/assets/fleettrack-logo.png',
      remarks: 'Auto-generated from TCOAnalyticsDashboard'
    };
  }