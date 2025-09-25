import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

export default function DriverIncidentHeatmap({ trips }) {
  const points = [];

  trips.forEach(t => {
    t.incidents?.forEach(i => {
      if (i.location) {
        points.push({
          lat: i.location.lat,
          lng: i.location.lng,
          label: `${t.driverName} — ${i.type}`,
          color: '#ff9f40'
        });
      }
    });
  });

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">🔥 Driver Incident Heatmap</h2>
      <MapContainer center={[-33.96, 25.6]} zoom={6} style={{ height: '400px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p, i) => (
          <CircleMarker key={i} center={[p.lat, p.lng]} radius={6} color={p.color}>
            <Tooltip>{p.label}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}