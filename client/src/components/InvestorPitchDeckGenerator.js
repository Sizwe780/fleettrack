export const generatePitchDeck = (fleetStats) => {
    return [
      { title: 'FleetTrack Overview', content: 'Real-time, audit-grade logistics intelligence.' },
      { title: 'Fleet Health', content: `Avg Score: ${fleetStats.avgScore}/100` },
      { title: 'Profitability', content: `Avg Profit: R${fleetStats.avgProfit}` },
      { title: 'Compliance', content: `Flagged Trips: ${fleetStats.flaggedCount}` },
      { title: 'Offline Resilience', content: 'Installable, sync-aware, GPS-enabled.' },
      { title: 'Public Sector Readiness', content: 'RBAC, audit trail, export bundles.' },
    ];
  };