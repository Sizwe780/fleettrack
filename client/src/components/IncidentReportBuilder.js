export const buildIncidentReport = ({ tripId, event }) => {
    return {
      tripId,
      timestamp: new Date().toISOString(),
      type: event.type,
      location: event.location,
      resolution: event.resolution || 'Pending',
      severity: event.severity,
    };
  };