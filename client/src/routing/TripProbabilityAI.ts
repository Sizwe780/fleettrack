// src/routing/TripProbabilityAI.ts
interface TripFactors {
    trafficLevel: number;
    weatherSeverity: number;
    driverFatigue: number;
  }
  
  export function predictTripSuccess(factors: TripFactors): number {
    const score = 100 - (factors.trafficLevel * 0.4 + factors.weatherSeverity * 0.3 + factors.driverFatigue * 0.3);
    return Math.max(0, Math.min(score, 100));
  }