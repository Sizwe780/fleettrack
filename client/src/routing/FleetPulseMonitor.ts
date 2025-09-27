// src/ops/FleetPulseMonitor.ts
interface FleetStatus {
    vehicleId: string;
    location: string;
    speed: number;
    alert?: string;
  }
  
  export function monitorFleetPulse(statuses: FleetStatus[]): void {
    statuses.forEach(({ vehicleId, speed, alert }) => {
      if (speed === 0 && alert) {
        console.warn(`Vehicle ${vehicleId} is stationary with alert: ${alert}`);
      }
    });
  }