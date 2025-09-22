import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const TripMap = ({ routeData }) => {
  const coordinates = routeData?.coordinates ?? [];
  const center = coordinates[0] ?? [-33.96, 25.61]; // Gqeberha fallback

  return (
    <div className="relative mt-6 h-64 rounded-md overflow-hidden">
      <MapContainer center={center} zoom={10} className="h-full w-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coordinates.map((coord, i) => (
          <Marker key={i} position={coord} icon={customIcon} />
        ))}
        <Polyline positions={coordinates} />
      </MapContainer>

      {/* Trip Metadata Overlay */}
      {routeData && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded shadow text-sm z-[1000]">
          <p><strong>Driver:</strong> {routeData.driver ?? 'Unassigned'}</p>
          <p><strong>Distance:</strong> {routeData.distance ?? 'N/A'} km</p>
          <p><strong>Start:</strong> {routeData.origin ?? 'Unknown'}</p>
          <p><strong>End:</strong> {routeData.destination ?? 'Unknown'}</p>
        </div>
      )}
    </div>
  );
};

export default TripMap;