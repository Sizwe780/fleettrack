import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

const TripClusterMap = ({ trips }) => {
  const clusters = trips.map((trip) => ({
    lat: trip.coordinates?.[0]?.lat ?? 0,
    lng: trip.coordinates?.[0]?.lng ?? 0,
    driver: trip.driver_name,
    status: trip.status,
  }));

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">📍 Trip Clusters</h2>
      <MapContainer center={[-33.96, 25.6]} zoom={6} className="h-[400px] w-full rounded-xl shadow-md">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {clusters.map((c, i) => (
          <CircleMarker key={i} center={[c.lat, c.lng]} radius={6} color="blue">
            <Tooltip>{c.driver} ({c.status})</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TripClusterMap;