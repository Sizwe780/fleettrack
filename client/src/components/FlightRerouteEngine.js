export const suggestFlightReroute = async ({ currentCoords, destinationCoords }) => {
    const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
    const origin = `${currentCoords.lat},${currentCoords.lng}`;
    const destination = `${destinationCoords.lat},${destinationCoords.lng}`;
  
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${origin}:${destination}/json?computeBest=true&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
  
    return data.routes.map(route => ({
      eta: new Date(Date.now() + route.summary.travelTimeInSeconds * 1000).toISOString(),
      reroutePath: route.legs,
    }));
  };