// infrastructure/services.ts
export function getSLAStatus(vehicleId: string) {
    return 'green'; // Replace with real logic
  }
  
  export function getRiskScore(vehicleId: string) {
    return Math.floor(Math.random() * 100); // Simulated score
  }
  
  export function getAuditLog(vehicleId: string) {
    return [
      { event: 'dispatch', timestamp: '2025-09-25T10:00:00Z' },
      { event: 'route deviation', timestamp: '2025-09-25T10:15:00Z' },
    ];
  }