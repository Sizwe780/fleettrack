// src/analytics/TripImpactScoring.ts
interface TripMetrics {
    delay: number;
    fuelUsed: number;
    alerts: number;
  }
  
  export function scoreTrip(metrics: TripMetrics): number {
    return 100 - (metrics.delay * 0.5 + metrics.fuelUsed * 0.3 + metrics.alerts * 2);
  }