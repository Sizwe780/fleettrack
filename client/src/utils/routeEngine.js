// utils/routeEngine.js
export const getEnhancedRoute = async (origin, destination) => {
    // Simulate route path (replace with real API later)
    const path = [
      [25.6001, -33.9601], // Gqeberha
      [24.9912, -34.0032], // midway
      [18.4241, -33.9249]  // Cape Town
    ];
  
    const estimatedTime = '8h 45m';
    const fuelStops = [
      { lat: -34.0001, lng: 24.9912, km: 500 },
      { lat: -33.9500, lng: 19.0000, km: 1000 }
    ];
    const restBreaks = [
      { lat: -33.9800, lng: 24.8000, hour: 4 },
      { lat: -33.9400, lng: 19.2000, hour: 8 }
    ];
  
    return { path, estimatedTime, fuelStops, restBreaks };
  };