import React from 'react';

export default function DispatchOptimizer({ fleet }) {
  const now = new Date();
  const upcomingTrips = fleet.filter(t => new Date(t.startTime) > now);
  const overbooked = fleet.filter((t, _, arr) =>
    arr.filter(x => x.vehicleId === t.vehicleId && x.tripId !== t.tripId).length > 2
  );

  const fatigueRiskDrivers = fleet
    .filter(t => t.analysis?.fatigueRisk > 7)
    .map(t => t.driverName);

  const delayForecasts = fleet
    .filter(t => t.analysis?.delayRisk > 6)
    .map(t => ({
      tripId: t.tripId,
      delay: t.analysis.delayRisk,
      origin: t.origin,
      destination: t.destination
    }));

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🧠 Dispatch Optimizer</h2>

      <p><strong>Upcoming Trips:</strong> {upcomingTrips.length}</p>

      {overbooked.length > 0 && (
        <div className="mt-4">
          <p><strong>🚨 Overbooked Vehicles:</strong></p>
          <ul className="list-disc pl-5 text-sm">
            {[...new Set(overbooked.map(t => t.vehicleId))].map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {fatigueRiskDrivers.length > 0 && (
        <div className="mt-4">
          <p><strong>⚠️ High Fatigue Risk Drivers:</strong></p>
          <ul className="list-disc pl-5 text-sm">
            {[...new Set(fatigueRiskDrivers)].map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {delayForecasts.length > 0 && (
        <div className="mt-4">
          <p><strong>⏳ Delay Forecasts:</strong></p>
          <ul className="list-disc pl-5 text-sm">
            {delayForecasts.map((t, i) => (
              <li key={i}>
                {t.tripId}: {t.origin} → {t.destination} | Delay Risk: {t.delay}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}