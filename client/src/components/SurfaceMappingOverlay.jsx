import React from 'react';

export default function SurfaceMappingOverlay({ landingZones }) {
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded shadow text-sm">
      <h4 className="font-semibold mb-2">🛰️ Mars Surface Mapping</h4>
      <ul className="space-y-1">
        {landingZones.map((zone, i) => (
          <li key={i}>
            📍 {zone.name} — Risk: {zone.riskLevel} — Terrain: {zone.terrainType}
          </li>
        ))}
      </ul>
    </div>
  );
}