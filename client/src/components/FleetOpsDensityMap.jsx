import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

export default function FleetOpsDensityMap({ trips }) {
  const density = trips
    .filter(t => t.liveLocation)
    .map((t, i) => ({
      lat: t.liveLocation.lat,
      lng: t.liveLocation.lng,
      count: 1,
      tripId: t.tripId,
      driver: t.driverName
    }));

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">📍 Fleet Ops Density Map</h2>
      <MapContainer center={[-33.96, 25.6]} zoom={6} style={{ height: '400px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {density.map((d, i) => (
          <CircleMarker key={i} center={[d.lat, d.lng]} radius={6} color="#007bff">
            <Tooltip>{d.tripId} — {d.driver}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}