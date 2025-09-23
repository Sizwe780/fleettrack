import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer';

export default function TripProfitHeatmap({ trips }) {
  const points = trips.map(t => ({
    lat: t.coordinates?.[0][1],
    lng: t.coordinates?.[0][0],
    intensity: t.analysis?.profitability?.netProfit ?? 0
  }));

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">💰 Profit Density Map</h3>
      <MapContainer center={[-33.96, 25.61]} zoom={10} style={{ height: '300px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <HeatmapLayer points={points} />
      </MapContainer>
    </div>
  );
}