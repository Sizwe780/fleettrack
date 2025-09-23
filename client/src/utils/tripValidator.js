export default function validateTripPayload(trip) {
    const errors = [];
  
    // Required fields
    const requiredFields = ['origin', 'destination', 'date', 'driver_name', 'current_location'];
    requiredFields.forEach((field) => {
      if (!trip[field] || typeof trip[field] !== 'string') {
        errors.push(`Missing or invalid field: ${field}`);
      }
    });
  
    // Coordinates must be an array of [lng, lat] pairs
    if (!Array.isArray(trip.coordinates)) {
      errors.push('Coordinates must be an array');
    } else {
      trip.coordinates.forEach((pair, i) => {
        if (!Array.isArray(pair) || pair.length !== 2 || pair.some((v) => typeof v !== 'number')) {
          errors.push(`Invalid coordinate at index ${i}`);
        }
      });
    }
  
    // Status history must be an array of objects with status + timestamp
    if (!Array.isArray(trip.statusHistory)) {
      errors.push('statusHistory must be an array');
    } else {
      trip.statusHistory.forEach((entry, i) => {
        if (
          typeof entry !== 'object' ||
          !entry.status ||
          !entry.timestamp ||
          typeof entry.status !== 'string' ||
          typeof entry.timestamp !== 'string'
        ) {
          errors.push(`Invalid statusHistory entry at index ${i}`);
        }
      });
    }
  
    // Remarks must be a flat array of strings
    if (trip.remarks && !Array.isArray(trip.remarks)) {
      errors.push('Remarks must be an array');
    } else if (trip.remarks?.some((r) => typeof r !== 'string')) {
      errors.push('Remarks must contain only strings');
    }
  
    // Health score must be a number between 0–100
    if (trip.healthScore !== undefined) {
      if (typeof trip.healthScore !== 'number' || trip.healthScore < 0 || trip.healthScore > 100) {
        errors.push('Invalid healthScore');
      }
    }
  
    // Vehicle stats must be a flat object
    if (trip.vehicleStats && typeof trip.vehicleStats !== 'object') {
      errors.push('vehicleStats must be an object');
    }
  
    // Driver stats must be a flat object
    if (trip.driverStats && typeof trip.driverStats !== 'object') {
      errors.push('driverStats must be an object');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  }