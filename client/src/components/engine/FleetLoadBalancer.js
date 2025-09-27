function balanceFleetLoad(trips, vehicles) {
    const usageMap = vehicles.reduce((acc, v) => ({ ...acc, [v.id]: 0 }), {});
    trips.forEach(t => usageMap[t.vehicle] = (usageMap[t.vehicle] || 0) + 1);
  
    const sortedVehicles = Object.entries(usageMap).sort((a, b) => a[1] - b[1]);
    return {
      leastUsedVehicle: sortedVehicles[0][0],
      usageStats: usageMap,
    };
  }