import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';

export default function IncidentHeatmap() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetch('/api/incidents')
      .then(res => res.json())
      .then(data => setIncidents(data));
  }, []);

  return (
    <div className="h-[500px] w-full rounded shadow overflow-hidden">
      <MapContainer center={[-33.96, 25.61]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {incidents.map((i, idx) => (
          <Circle key={idx} center={[i.lat, i.lng]} radius={100} color="red" />
        ))}
      </MapContainer>
    </div>
  );
}