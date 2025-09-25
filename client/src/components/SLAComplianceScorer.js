export const scoreTripCompliance = ({ durationHours, slaLimitHours, incidents }) => {
    const breached = durationHours > slaLimitHours;
    const score = breached ? 60 : incidents.length > 0 ? 80 : 100;
    return { score, breached, incidents };
  };