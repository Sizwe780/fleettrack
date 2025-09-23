const DriverFatigueEstimator = (trip) => {
    const segments = trip.analysis?.dailyLogs?.flatMap(log => log.segments) ?? [];
    const longDrives = segments.filter(seg => seg.status === 'Driving' && parseFloat(seg.end) - parseFloat(seg.start) > 4);
  
    const restBreaks = segments.filter(seg => seg.status === 'Off Duty');
    const fatigueRisk = longDrives.length > 2 && restBreaks.length < 2;
  
    return fatigueRisk ? 'High fatigue risk' : 'Fatigue risk low';
  };
  
  export default DriverFatigueEstimator;