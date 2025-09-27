// src/routing/FleetBehaviorSimulator.ts
interface SimulationInput {
    weather: string;
    traffic: number;
    fleetSize: number;
  }
  
  export function simulateBehavior(input: SimulationInput): string {
    if (input.traffic > 80 || input.weather === 'storm') {
      return 'High risk: reroute recommended';
    }
    return 'Normal operation';
  }