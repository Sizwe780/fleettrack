import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TripMap = ({ routeData }) => {
  const coordinates = routeData?.coordinates ?? [];

  return (
    <div className="mt-6 h-64 rounded-md overflow-hidden">
      <MapContainer center={coordinates[0]} zoom={10} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coordinates.map((coord, i) => (
          <Marker key={i} position={coord} />
        ))}
        <Polyline positions={coordinates} />
      </MapContainer>
    </div>
  );
};

export default TripMap;