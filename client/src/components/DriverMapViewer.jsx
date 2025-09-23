import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function DriverMapViewer() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetch('/api/driver-locations')
      .then(res => res.json())
      .then(data => setDrivers(data));
  }, []);

  return (
    <div className="h-[600px] w-full">
      <MapContainer center={[-33.96, 25.61]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {drivers.map((d, i) => (
          <Marker key={i} position={[d.lat, d.lng]}>
            <Popup>
              <strong>{d.name}</strong><br />
              Role: {d.role}<br />
              Status: {d.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}