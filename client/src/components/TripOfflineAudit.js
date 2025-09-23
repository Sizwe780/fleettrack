export const validateOfflineTrip = (trip) => {
    const required = ['origin', 'destination', 'departureTime', 'cycleUsed'];
    const missing = required.filter((field) => !trip[field] || trip[field].trim() === '');
  
    return {
      isValid: missing.length === 0,
      missingFields: missing,
    };
  };