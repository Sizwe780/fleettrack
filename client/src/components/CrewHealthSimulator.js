export const simulateCrewHealth = ({ hoursElapsed, systemStatus }) => {
    const fatigue = hoursElapsed > 72 ? 'critical' : hoursElapsed > 48 ? 'high' : 'low';
    const stress = systemStatus !== 'Nominal' ? 'elevated' : 'stable';
    return { fatigue, stress };
  };