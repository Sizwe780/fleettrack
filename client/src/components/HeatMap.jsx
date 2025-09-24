import 'leaflet.heat';

const heatLayer = L.heatLayer(pointsArray, { radius: 25 }).addTo(map);