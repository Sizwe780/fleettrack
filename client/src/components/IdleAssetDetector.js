const IdleAssetDetector = (fleetTrips, thresholdDays = 14) => {
    const now = new Date();
    const assetLastSeen = {};
  
    fleetTrips.forEach((trip) => {
      const asset = trip.vehicleId;
      const date = new Date(trip.date);
      if (!assetLastSeen[asset] || date > assetLastSeen[asset]) {
        assetLastSeen[asset] = date;
      }
    });
  
    return Object.entries(assetLastSeen)
      .filter(([_, lastDate]) => (now - lastDate) / (1000 * 60 * 60 * 24) > thresholdDays)
      .map(([asset]) => asset);
  };
  
  export default IdleAssetDetector;