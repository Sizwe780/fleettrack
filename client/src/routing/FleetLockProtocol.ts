// src/routing/FleetLockProtocol.ts
export function lockFleet(fleetId: string): string {
    console.warn(`Fleet ${fleetId} locked due to national protocol`);
    return `Fleet ${fleetId} is now immobilized`;
  }