import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

export default function FleetOpsRecoveryMap({ trips }) {
  const points = trips
    .filter(t => t.liveLocation)
    .map(t => ({
      lat: t.liveLocation.lat,
      lng: t.liveLocation.lng,
      label: `${t.tripId} — ${t.breachDetected ? 'Breach' : t.recoveryTime ? 'Recovered' : 'Normal'}`,
      color: t.breachDetected ? '#d00' : t.recoveryTime ? '#28a745' : '#007bff'
    }));

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">🗺️ Fleet Recovery Map</h2>
      <MapContainer center={[-33.96, 25.6]} zoom={6} style={{ height: '400px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p, i) => (
          <CircleMarker key={i} center={[p.lat, p.lng]} radius={8} color={p.color}>
            <Tooltip>{p.label}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}