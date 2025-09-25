export const estimateMissionCost = ({ durationHours, fuelUsed, riskLevel }) => {
    const base = 50000;
    const fuelCost = fuelUsed * 120;
    const riskMultiplier = riskLevel === 'high' ? 1.5 : riskLevel === 'medium' ? 1.2 : 1;
    return Math.round((base + fuelCost) * riskMultiplier);
  };