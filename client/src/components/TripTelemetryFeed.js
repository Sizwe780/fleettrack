export const startTelemetryFeed = (tripId, onUpdate) => {
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const payload = {
          timestamp: new Date().toISOString(),
          lat: latitude,
          lng: longitude,
          status: 'Driving',
        };
        onUpdate(payload);
      },
      err => console.warn('Telemetry error:', err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
  
    return () => navigator.geolocation.clearWatch(watchId);
  };