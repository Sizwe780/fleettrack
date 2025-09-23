const ViolationScorer = (trip) => {
    const violations = [];
    const drivingHours = trip.analysis?.dailyLogs?.reduce((sum, log) => {
      const driveSegs = log.segments?.filter(s => s.status === 'Driving') ?? [];
      return sum + driveSegs.reduce((s, seg) => s + (parseFloat(seg.end) - parseFloat(seg.start)), 0);
    }, 0);
  
    if (drivingHours > 11) violations.push('Exceeded 11-hour driving limit');
    if (parseFloat(trip.cycleUsed ?? '0') > 70) violations.push('Exceeded 70-hour cycle limit');
    if (trip.analysis?.remarks?.includes('fatigue')) violations.push('Driver fatigue risk');
  
    return violations;
  };
  
  export default ViolationScorer;