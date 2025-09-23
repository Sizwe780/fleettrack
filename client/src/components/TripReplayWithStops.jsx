import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TripReplayWithStops = ({ trip }) => {
  const coordinates = trip?.coordinates || [];
  const hasPath = Array.isArray(coordinates) && coordinates.length > 0;
  const mapCenter = hasPath ? [coordinates[0].lat, coordinates[0].lng] : [-33.9608, 25.6022]; // Gqeberha fallback

  return (
    <div className="mt-4 space-y-4">
      <MapContainer center={mapCenter} zoom={6} style={{ height: '400px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {hasPath && (
          <>
            <Polyline
              positions={coordinates.map(coord => [coord.lat, coord.lng])}
              color="purple"
            />
            <Marker position={[coordinates[0].lat, coordinates[0].lng]}>
              <Popup>Origin: {trip.origin}</Popup>
            </Marker>
            <Marker position={[coordinates[coordinates.length - 1].lat, coordinates[coordinates.length - 1].lng]}>
              <Popup>Destination: {trip.destination}</Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-3 rounded text-xs">
        <summary className="cursor-pointer font-semibold text-gray-700">🛰️ Replay Payload Debug</summary>
        <pre className="overflow-x-auto mt-2">{JSON.stringify(coordinates, null, 2)}</pre>
      </details>
    </div>
  );
};

export default TripReplayWithStops;