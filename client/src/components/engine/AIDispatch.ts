// src/engines/AIDispatch.ts

export interface TripRequest {
    origin: string;
    destination: string;
    urgency: "low" | "medium" | "high";
    cargoType?: string;
    riskLevel?: number; // 0–100
  }
  
  export interface DriverProfile {
    id: string;
    name: string;
    fatigueScore: number; // 0–100
    recentIncidents: number;
    preferredRoutes: string[];
  }
  
  export interface VehicleProfile {
    id: string;
    type: string;
    fuelLevel: number; // %
    maintenanceDue: boolean;
    location: string;
  }
  
  export interface DispatchRecommendation {
    driverId: string;
    vehicleId: string;
    confidence: number; // 0–100
    notes: string[];
  }
  
  export function generateDispatch(
    trip: TripRequest,
    drivers: DriverProfile[],
    vehicles: VehicleProfile[]
  ): DispatchRecommendation | null {
    if (!trip || drivers.length === 0 || vehicles.length === 0) return null;
  
    const notes: string[] = [];
    let bestDriver: DriverProfile | null = null;
    let bestVehicle: VehicleProfile | null = null;
    let highestScore = -1;
  
    for (const driver of drivers) {
      if (driver.fatigueScore > 80) {
        notes.push(`Driver ${driver.name} skipped due to high fatigue.`);
        continue;
      }
  
      for (const vehicle of vehicles) {
        if (vehicle.maintenanceDue || vehicle.fuelLevel < 30) {
          notes.push(`Vehicle ${vehicle.id} skipped due to low fuel or maintenance.`);
          continue;
        }
  
        const routeMatch = driver.preferredRoutes.includes(trip.destination);
        const riskPenalty = trip.riskLevel ? trip.riskLevel / 10 : 0;
        const score =
          100 -
          driver.fatigueScore -
          driver.recentIncidents * 5 -
          riskPenalty +
          (routeMatch ? 10 : 0) +
          vehicle.fuelLevel / 2;
  
        if (score > highestScore) {
          highestScore = score;
          bestDriver = driver;
          bestVehicle = vehicle;
        }
      }
    }
  
    if (!bestDriver || !bestVehicle) return null;
  
    notes.push(`Selected Driver: ${bestDriver.name}`);
    notes.push(`Selected Vehicle: ${bestVehicle.id}`);
    notes.push(`Dispatch Score: ${Math.round(highestScore)}`);
  
    return {
      driverId: bestDriver.id,
      vehicleId: bestVehicle.id,
      confidence: Math.min(100, Math.round(highestScore)),
      notes
    };
  }