export const startFlightTelemetry = (flightId, onUpdate) => {
    const interval = setInterval(() => {
      const payload = {
        timestamp: new Date().toISOString(),
        altitude: 32000 + Math.random() * 1000, // feet
        speed: 850 + Math.random() * 20, // km/h
        fuelLevel: Math.max(0, 100 - Math.random() * 0.3),
        systemStatus: 'Nominal',
      };
      onUpdate(payload);
    }, 10000); // every 10 seconds
  
    return () => clearInterval(interval);
  };