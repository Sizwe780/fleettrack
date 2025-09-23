const detectTripAnomalies = (tripData) => {
    const anomalies = [];
    if (tripData.cycle_used > 10) {
      anomalies.push('Unusually long cycle usage detected.');
    }
    return anomalies;
  };
  
  module.exports = detectTripAnomalies;