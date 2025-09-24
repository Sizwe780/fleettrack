export const dispatchTripAlerts = ({ breached, riskLevel }) => {
    if (breached) {
      alert('🚨 SLA breach predicted. Consider rerouting.');
    } else if (riskLevel === 'medium') {
      alert('⚠️ Arrival time approaching SLA limit.');
    }
  };