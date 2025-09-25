export const validateLegalCompliance = ({ trip }) => {
    return {
      tripId: trip.id,
      logsheetStatus: trip.logsheets.length > 0 ? '✅ Present' : '🚨 Missing',
      exportReady: trip.slaScore >= 80 && trip.signature ? '✅ Compliant' : '⚠️ Review Needed',
      violations: trip.incidents.filter(i => i.severity === 'high').length,
    };
  };