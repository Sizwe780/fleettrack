// src/types/TripLog.ts
export interface TripLog {
    timestamp: string;
    event: string;
    actor: string;
    location?: string;
  }