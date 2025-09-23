const TripFatigueFlagger = (trip) => {
    const remarks = trip.analysis?.remarks ?? '';
    const fatigueKeywords = ['fatigue', 'drowsy', 'exhausted', 'overworked'];
    const flagged = fatigueKeywords.some(k => remarks.toLowerCase().includes(k));
  
    return flagged ? '⚠️ Fatigue Risk Detected' : '✅ No Fatigue Indicators';
  };
  
  export default TripFatigueFlagger;