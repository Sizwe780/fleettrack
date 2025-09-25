export const generateInsuranceClaim = ({ incident }) => {
    return {
      claimId: `CLAIM-${Date.now()}`,
      type: incident.type,
      severity: incident.severity,
      location: incident.location,
      resolution: incident.resolution,
      submittedAt: new Date().toISOString(),
    };
  };