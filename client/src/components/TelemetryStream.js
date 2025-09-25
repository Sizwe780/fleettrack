export const startTelemetryStream = (missionId, onUpdate) => {
    const interval = setInterval(() => {
      const payload = {
        timestamp: new Date().toISOString(),
        location: {
          lat: -1.5 + Math.random() * 3,
          lng: 135.0 + Math.random() * 3,
        },
        velocity: 24000 + Math.random() * 500, // km/h
        fuelLevel: Math.max(0, 100 - Math.random() * 0.5),
        systemStatus: 'Nominal',
      };
      onUpdate(payload);
    }, 10000); // every 10 seconds
  
    return () => clearInterval(interval);
  };