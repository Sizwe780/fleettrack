export const renderLogsheet = (vehicleId: string, log: any[]) => {
    return {
      layout: 'A3',
      vehicleId,
      columns: ['Timestamp', 'Event', 'Operator', 'Location', 'Status'],
      rows: log.map(entry => ({
        Timestamp: entry.timestamp,
        Event: entry.event,
        Operator: entry.operator || 'N/A',
        Location: entry.location || 'Unknown',
        Status: entry.status || 'Unclassified'
      })),
      auditReady: true
    };
  };