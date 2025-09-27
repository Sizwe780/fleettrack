function recognizeIncidentPatterns(trips) {
    const patternMap = {};
    trips.forEach(trip => {
      trip.incidents?.forEach(incident => {
        const key = `${incident.type}-${incident.location}`;
        patternMap[key] = (patternMap[key] || 0) + 1;
      });
    });
  
    const flaggedPatterns = Object.entries(patternMap)
      .filter(([_, count]) => count > 3)
      .map(([pattern, count]) => ({ pattern, count }));
  
    return flaggedPatterns;
  }