// src/ops/DispatchOverrideMode.ts
export function overrideDispatch(tripId: string, reason: string): boolean {
    console.log(`Dispatch override triggered for ${tripId}: ${reason}`);
    return true;
  }