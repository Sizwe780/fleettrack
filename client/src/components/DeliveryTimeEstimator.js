export const estimateDeliveryTime = ({ trip }) => {
    const baseTime = trip.distance / trip.avgSpeed;
    const delayFactor = trip.trafficLevel > 0.7 ? 1.3 : 1;
    const fatigueFactor = trip.driverFatigue === 'high' ? 1.2 : 1;
    return {
      tripId: trip.id,
      estimatedETA: new Date(Date.now() + baseTime * delayFactor * fatigueFactor * 3600 * 1000).toISOString(),
    };
  };