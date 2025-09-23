const detectTripAnomalies = (trip) => {
    const anomalies = [];
  
    const fuelUsed = trip.analysis?.ifta?.fuelUsed ?? 0;
    const distance = trip.analysis?.profitability?.distanceMiles ?? 0;
    const avgSpeed = distance > 0 ? (distance / ((trip.durationHours ?? 1))) : 0;
  
    // Fuel efficiency check
    if (fuelUsed > 60 && distance < 100) {
      anomalies.push('Excessive fuel usage for short distance');
    }
  
    // Delay detection
    if (trip.expectedDurationHours && trip.durationHours > trip.expectedDurationHours * 1.5) {
      anomalies.push('Trip duration significantly exceeded expected time');
    }
  
    // Route deviation check
    if (trip.routeDeviationScore && trip.routeDeviationScore > 0.3) {
      anomalies.push('Route deviation detected');
    }
  
    return anomalies;
  };
  
  export default detectTripAnomalies;