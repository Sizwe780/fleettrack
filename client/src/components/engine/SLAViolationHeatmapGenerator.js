function generateSLAViolationHeatmap(trips) {
    const heatmap = {};
    trips.forEach(trip => {
      if (trip.analysis?.slaBreached) {
        const loc = trip.destination;
        heatmap[loc] = (heatmap[loc] || 0) + 1;
      }
    });
    return Object.entries(heatmap).map(([location, count]) => ({ location, count }));
  }