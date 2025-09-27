// src/ops/FleetHeatMapping.ts
interface LocationPing {
    lat: number;
    lng: number;
    congestion: number;
  }
  
  export function generateHeatMap(pings: LocationPing[]): LocationPing[] {
    return pings.filter(p => p.congestion > 70);
  }