export const traceIncident = ({ tripId, anomalies }) => {
    return {
      tripId,
      anomalies,
      resolutionSteps: anomalies.map(a => `Reviewed ${a.timestamp}, flagged for audit`),
    };
  };