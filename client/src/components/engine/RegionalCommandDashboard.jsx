import React from 'react';

export default function RegionalCommandDashboard({ regions }) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-navy mb-2">🗺️ Regional Command Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-sm">
        {regions.map((region, i) => (
          <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-navy mb-1">{region.name}</p>
            <p>Fleet Size: {region.fleetSize}</p>
            <p>Active Trips: {region.activeTrips}</p>
            <p>Stress Level: <strong className="text-red-600">{region.stress}</strong></p>
          </div>
        ))}
      </div>
    </section>
  );
}