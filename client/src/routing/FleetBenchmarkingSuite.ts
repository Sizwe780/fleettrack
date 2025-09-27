// src/analytics/FleetBenchmarkingSuite.ts
interface FleetMetrics {
    fleetId: string;
    efficiency: number;
    safetyScore: number;
  }
  
  export function benchmarkFleets(metrics: FleetMetrics[]): string {
    const topFleet = metrics.reduce((a, b) => (a.efficiency > b.efficiency ? a : b));
    return `Top Fleet: ${topFleet.fleetId} with ${topFleet.efficiency.toFixed(2)} efficiency`;
  }