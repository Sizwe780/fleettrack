// src/security/AuditExportSuite.ts

interface TripLog {
    timestamp: string;
    event: string;
    actor: string;
  }
  
  export function exportAuditLog(logs: TripLog[]): string {
    return logs.map(log => `${log.timestamp},${log.event},${log.actor}`).join('\n');
  }