export const predictOptimalRoute = ({ origin, destination, trafficLevel, fatigueRisk }) => {
    const reroute = trafficLevel > 0.7 || fatigueRisk === 'critical';
    return {
      origin,
      destination,
      suggestedRoute: reroute ? 'Alternate corridor activated' : 'Primary route confirmed',
      eta: new Date(Date.now() + (reroute ? 5400 : 3600) * 1000).toISOString(),
    };
  };