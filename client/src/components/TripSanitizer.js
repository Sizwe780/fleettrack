const TripSanitizer = (trip) => {
    const clean = { ...trip };
  
    clean.origin = trip.origin?.trim() || 'Unknown';
    clean.destination = trip.destination?.trim() || 'Unknown';
    clean.driver_name = trip.driver_name?.trim() || 'Anonymous';
    clean.cycleUsed = parseFloat(trip.cycleUsed ?? '0');
    clean.departureTime = trip.departureTime ?? '08:00';
  
    return clean;
  };
  
  export default TripSanitizer;