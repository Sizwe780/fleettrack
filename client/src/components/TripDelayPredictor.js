export const predictDelayRisk = ({ departureTime, arrivalTime, slaLimitHours }) => {
    const start = new Date(departureTime);
    const end = new Date(arrivalTime);
    const durationHours = (end - start) / (1000 * 60 * 60);
    const breached = durationHours > slaLimitHours;
  
    return {
      breached,
      durationHours: Math.round(durationHours * 10) / 10,
      riskLevel: breached ? 'high' : durationHours > slaLimitHours * 0.9 ? 'medium' : 'low',
    };
  };