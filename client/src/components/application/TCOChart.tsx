import React from 'react';

export function TCOChart({ data }: { data: any }) {
  return (
    <div className="tco-chart">
      <h3>📊 Cost Breakdown</h3>
      <ul>
        <li>Fuel: R{data.fuel}</li>
        <li>Maintenance: R{data.maintenance}</li>
        <li>Penalties: R{data.penalties}</li>
        <li>Driver Behavior: R{data.behavior}</li>
      </ul>
    </div>
  );
}