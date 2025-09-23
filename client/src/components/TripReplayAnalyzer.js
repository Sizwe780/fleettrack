const TripReplayAnalyzer = (trip) => {
    const path = trip.coordinates ?? [];
    const deviations = [];
  
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const dx = Math.abs(curr.lat - prev.lat);
      const dy = Math.abs(curr.lng - prev.lng);
      if (dx > 0.1 || dy > 0.1) deviations.push({ index: i, lat: curr.lat, lng: curr.lng });
    }
  
    return deviations;
  };
  
  export default TripReplayAnalyzer;