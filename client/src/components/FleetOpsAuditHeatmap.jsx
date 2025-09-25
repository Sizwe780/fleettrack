import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

export default function FleetOpsAuditHeatmap({ trips }) {
  const points = trips.map(t => {
    const score = t.auditScore || 100;
    const color = score < 60 ? '#d00' : score < 80 ? '#ff9f40' : '#28a745';
    return {
      lat: t.liveLocation?.lat,
      lng: t.liveLocation?.lng,
      label: `${t.tripId} — ${score}%`,
      color
    };
  }).filter(p => p.lat && p.lng);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">📊 Audit Heatmap</h2>
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