import React from 'react';
import { MapContainer, TileLayer, HeatmapLayer } from 'react-leaflet';

export default function FleetOpsHeatmap({ trips }) {
  const heatPoints = trips
    .filter(t => t.liveLocation)
    .map(t => [t.liveLocation.lat, t.liveLocation.lng, t.breachDetected ? 1 : 0.5]);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">🔥 Fleet Ops Heatmap</h2>
      <MapContainer center={[-33.96, 25.6]} zoom={6} style={{ height: '400px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {heatPoints.length > 0 && <HeatmapLayer points={heatPoints} radius={25} />}
      </MapContainer>
    </div>
  );
}