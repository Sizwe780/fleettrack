const suggestDriverForTrip = (trip, drivers) => {
    if (!trip || !Array.isArray(drivers)) return null;
  
    const originCoords = trip.originCoords ?? [0, 0];
  
    const scoredDrivers = drivers
      .filter(d => d.role === 'driver')
      .map(driver => {
        const lastTripEnd = new Date(driver.lastTripCompletedAt ?? 0);
        const hoursSinceLastTrip = (Date.now() - lastTripEnd.getTime()) / 3600000;
  
        const distanceScore = driver.location
          ? Math.sqrt(
              Math.pow(driver.location[0] - originCoords[0], 2) +
              Math.pow(driver.location[1] - originCoords[1], 2)
            )
          : 100;
  
        const fatiguePenalty = hoursSinceLastTrip < 4 ? 20 : 0;
  
        const score =
          (driver.avgHealthScore ?? 0) +
          (driver.avgProfit ?? 0) / 100 -
          (driver.violationCount ?? 0) * 5 -
          distanceScore -
          fatiguePenalty;
  
        return { uid: driver.uid, name: driver.name, score };
      });
  
    const best = scoredDrivers.sort((a, b) => b.score - a.score)[0];
    return best ?? null;
  };
  
  export default suggestDriverForTrip;