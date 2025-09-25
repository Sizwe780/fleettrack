export const suggestAlternateRoutes = async (originCoords, destinationCoords) => {
    const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
    const origin = `${originCoords.lat},${originCoords.lng}`;
    const destination = `${destinationCoords.lat},${destinationCoords.lng}`;
  
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${origin}:${destination}/json?traffic=true&computeBest=true&key=${apiKey}`;
  
    const res = await fetch(url);
    const data = await res.json();
    return data.routes.map(route => ({
      summary: route.summary,
      legs: route.legs,
      eta: new Date(Date.now() + route.summary.travelTimeInSeconds * 1000).toISOString(),
      delay: route.summary.trafficDelayInSeconds,
    }));
  };