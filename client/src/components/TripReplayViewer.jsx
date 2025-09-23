import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

export default function TripReplayViewer() {
  const [trip, setTrip] = useState([]);

  useEffect(() => {
    fetch('/api/trip-replay?driver=DR001')
      .then(res => res.json())
      .then(data => setTrip(data));
  }, []);

  return (
    <div className="h-[600px] w-full">
      <MapContainer center={[-33.96, 25.61]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={trip.map(p => [p.lat, p.lng])} color="blue" />
      </MapContainer>
    </div>
  );
}