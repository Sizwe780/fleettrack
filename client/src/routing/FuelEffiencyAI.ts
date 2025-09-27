// src/analytics/FuelEfficiencyAI.ts
interface TripData {
    distance: number;
    fuelUsed: number;
    driverId: string;
  }
  
  export function calculateEfficiency(trip: TripData): number {
    return trip.distance / trip.fuelUsed;
  }
  
  export function compareDrivers(trips: TripData[]): Record<string, number> {
    const scores: Record<string, number> = {};
  
    trips.forEach(({ driverId, distance, fuelUsed }) => {
      const efficiency = distance / fuelUsed;
      scores[driverId] = (scores[driverId] || 0) + efficiency;
    });
  
    return scores;
  }