// src/analytics/IncidentCostEstimator.ts
interface Incident {
    type: string;
    damage: number;
    delayMinutes: number;
  }
  
  export function estimateCost(incident: Incident): number {
    return incident.damage + incident.delayMinutes * 50;
  }