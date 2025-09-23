const TripHealthScoreEngine = (trip) => {
    let score = 100;
  
    const fuelUsed = trip.analysis?.ifta?.fuelUsed ?? 0;
    const violations = trip.analysis?.violations ?? [];
    const fatigueFlag = trip.analysis?.remarks?.includes('fatigue');
  
    if (fuelUsed > 400) score -= 10;
    if (violations.length > 0) score -= violations.length * 5;
    if (fatigueFlag) score -= 15;
  
    return Math.max(score, 0);
  };
  
  export default TripHealthScoreEngine;