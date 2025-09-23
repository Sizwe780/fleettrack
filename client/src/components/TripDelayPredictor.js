const TripDelayPredictor = (trip) => {
    const plannedDeparture = new Date(`${trip.date}T${trip.departureTime}`);
    const actualDeparture = new Date(trip.actualDeparture ?? plannedDeparture);
    const delayMinutes = (actualDeparture - plannedDeparture) / (1000 * 60);
  
    const delayRisk = delayMinutes > 30 ? 'High' : delayMinutes > 10 ? 'Moderate' : 'Low';
  
    return { delayMinutes, delayRisk };
  };
  
  export default TripDelayPredictor;