const TripRestBreakValidator = (trip) => {
    const logs = trip.analysis?.dailyLogs ?? [];
    const violations = [];
  
    logs.forEach((log, i) => {
      const rest = log.segments?.filter(s => s.status === 'Off Duty') ?? [];
      const totalRest = rest.reduce((sum, seg) => sum + (parseFloat(seg.end) - parseFloat(seg.start)), 0);
      if (totalRest < 10) violations.push(`Day ${i + 1}: Only ${totalRest} hrs rest`);
    });
  
    return violations;
  };
  
  export default TripRestBreakValidator;