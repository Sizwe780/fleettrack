export function syncWithEmergencyUnits(trip) {
    const { origin, destination, routeData } = trip;
    const emergencyPayload = {
      tripId: trip.id,
      route: routeData.path,
      origin,
      destination,
      estimatedArrival: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      priority: trip.status === "critical" ? "High" : "Normal"
    };
  
    return {
      dispatchCode: `EM-${trip.id.slice(0, 6).toUpperCase()}`,
      syncedUnits: ["Traffic Control", "Medical Response", "Security Grid"],
      payload: emergencyPayload
    };
  }