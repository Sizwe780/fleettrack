// geospatial/RiskHeatmap.tsx
import React from 'react';
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';

const RiskHeatmap = ({ fleetData }) => (
  <MapContainer center={[-33.96, 25.6]} zoom={10} style={{ height: '100vh', width: '100%' }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {fleetData.map((vehicle, i) => (
      <Circle
        key={i}
        center={[vehicle.lat, vehicle.lng]}
        radius={vehicle.riskScore * 100}
        pathOptions={{ color: getRiskColor(vehicle.riskScore), fillOpacity: 0.5 }}
      >
        <Tooltip>
          <div>
            <strong>ID:</strong> {vehicle.id}<br />
            <strong>Risk:</strong> {vehicle.riskScore}<br />
            <strong>ETA:</strong> {vehicle.eta}<br />
            <strong>SLA:</strong> {vehicle.slaStatus}
          </div>
        </Tooltip>
      </Circle>
    ))}
  </MapContainer>
);

const getRiskColor = (score: number): string => {
  if (score > 80) return 'red';
  if (score > 50) return 'orange';
  return 'green';
};

export default RiskHeatmap;