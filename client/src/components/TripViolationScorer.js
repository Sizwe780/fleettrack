const TripViolationScorer = (trip) => {
    const violations = [];
  
    const drivingHours = trip.analysis?.dailyLogs?.reduce((sum, log) => {
      const driveSegs = log.segments?.filter(s => s.status === 'Driving') ?? [];
      return sum + driveSegs.reduce((s, seg) => s + (parseFloat(seg.end) - parseFloat(seg.start)), 0);
    }, 0);
  
    if (drivingHours > 11) violations.push('Exceeded 11-hour driving limit');
  
    const cycleUsed = parseFloat(trip.cycleUsed ?? '0');
    if (cycleUsed > 70) violations.push('Exceeded 70-hour cycle limit');
  
    const fatigueFlag = trip.analysis?.remarks?.includes('fatigue');
    if (fatigueFlag) violations.push('Driver fatigue risk');
  
    return violations;
  };
  
  export default TripViolationScorer;