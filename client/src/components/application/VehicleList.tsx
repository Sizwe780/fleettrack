import React from 'react';

export function VehicleList({ vehicles }: { vehicles: any[] }) {
  return (
    <div className="vehicle-list">
      <h3>🚗 Vehicles</h3>
      <ul>
        {vehicles.map((v) => (
          <li key={v.vehicleId}>{v.name} ({v.status})</li>
        ))}
      </ul>
    </div>
  );
}