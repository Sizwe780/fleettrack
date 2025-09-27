// src/analytics/DriverPerformanceIndex.ts
interface Trip {
    driverId: string;
    speed: number;
    safetyScore: number;
  }
  
  export function scoreDriver(trips: Trip[]): Record<string, number> {
    const scores: Record<string, number> = {};
    trips.forEach(({ driverId, speed, safetyScore }) => {
      scores[driverId] = (scores[driverId] || 0) + (safetyScore - speed * 0.1);
    });
    return scores;
  }