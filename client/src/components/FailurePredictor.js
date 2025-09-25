export const predictFailureRisk = ({ fuelLevel, velocity }) => {
    if (fuelLevel < 10) return 'critical';
    if (fuelLevel < 25) return 'warning';
    if (velocity > 26000) return 'over-speed';
    return 'nominal';
  };