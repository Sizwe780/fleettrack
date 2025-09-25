export const calculateETA = async (originCoords, destinationCoords) => {
    const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
  
    const origin = `${originCoords.lat},${originCoords.lng}`;
    const destination = `${destinationCoords.lat},${destinationCoords.lng}`;
  
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${origin}:${destination}/json?traffic=true&key=${apiKey}`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
  
      const etaSeconds = data.routes?.[0]?.summary?.travelTimeInSeconds ?? 0;
      const arrivalTime = new Date(Date.now() + etaSeconds * 1000).toISOString();
  
      return {
        arrivalTime,
        durationMinutes: Math.round(etaSeconds / 60),
        trafficDelayMinutes: Math.round(data.routes?.[0]?.summary?.trafficDelayInSeconds / 60) || 0,
      };
    } catch (err) {
      console.error('ETA fetch error:', err.message);
      return {
        arrivalTime: null,
        durationMinutes: null,
        trafficDelayMinutes: null,
      };
    }
  };