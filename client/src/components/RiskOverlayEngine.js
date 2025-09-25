export const generateRiskOverlay = ({ routeCoords }) => {
    return routeCoords.map((coord, i) => ({
      lat: coord.lat,
      lng: coord.lng,
      riskLevel: Math.random() > 0.8 ? 'High' : 'Low',
      alert: Math.random() > 0.9 ? '🚨 Protest zone detected' : null,
    }));
  };