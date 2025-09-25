export const scoreFlightCompliance = ({ durationHours, slaLimitHours, incidents }) => {
    const breached = durationHours > slaLimitHours;
    const score = breached ? 65 : incidents.length > 0 ? 85 : 100;
    return { score, breached, incidents };
  };