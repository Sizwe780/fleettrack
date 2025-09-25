export const simulateFatigueRisk = ({ hoursElapsed, velocity, systemStatus }) => {
    if (hoursElapsed > 72 || systemStatus !== 'Nominal') return 'critical';
    if (hoursElapsed > 48) return 'high';
    if (hoursElapsed > 24) return 'medium';
    return 'low';
  };