export const generateMissionInvoice = ({ durationHours, fuelUsed, roversDeployed }) => {
    const base = 75000;
    const fuelCost = fuelUsed * 120;
    const roverOps = roversDeployed.length * 5000;
    const total = base + fuelCost + roverOps;
    return { total: `R${total}`, breakdown: { base, fuelCost, roverOps } };
  };