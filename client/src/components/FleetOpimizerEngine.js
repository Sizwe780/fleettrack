export const optimizeFleet = ({ trips }) => {
    const suggestions = trips.map(t => ({
      tripId: t.id,
      reroute: t.trafficLevel > 0.7 ? 'Suggested alternate corridor' : null,
      vehicleSwap: t.fuelUsed > 80 ? 'Use hybrid vehicle' : null,
    }));
    return suggestions;
  };