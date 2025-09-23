const validateTripPayload = (tripData) => {
    const requiredFields = ['origin', 'destination', 'date', 'driver_name', 'cycle_used', 'departure_time'];
    for (const field of requiredFields) {
      if (!tripData[field]) {
        return `Missing required field: ${field}`;
      }
    }
    return null;
  };
  
  module.exports = validateTripPayload;