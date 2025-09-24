const TripEfficiencyScore = (trip) => {
    const km = trip.analysis?.odometerKm ?? 0;
    const fuel = trip.analysis?.ifta?.fuelUsed ?? 0;
  
    if (km === 0 || fuel === 0) return 0;
  
    const ratio = km / fuel;
    let score = 100;
  
    if (ratio < 2) score -= 30;
    else if (ratio < 3) score -= 15;
  
    return Math.max(score, 0);
  };
  
  export default TripEfficiencyScore;