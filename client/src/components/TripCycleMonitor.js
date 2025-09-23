const TripCycleMonitor = (trip) => {
    const cycleUsed = parseFloat(trip.cycleUsed ?? '0');
    const cycleLimit = 70;
    const remaining = cycleLimit - cycleUsed;
  
    return {
      cycleUsed,
      remaining,
      status: remaining < 10 ? '⚠️ Near Limit' : '✅ Within Limit',
    };
  };
  
  export default TripCycleMonitor;