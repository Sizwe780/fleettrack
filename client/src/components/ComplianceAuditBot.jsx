import React from 'react';

export default function TripPlannerAI({ vehicles, drivers, routes }) {
  const fatigueThreshold = 7;
  const delayThreshold = 6;

  const availableDrivers = drivers.filter(d => d.fatigueScore < fatigueThreshold);
  const availableVehicles = vehicles.filter(v => !v.isBooked);

  const safeRoutes = routes.filter(r =>
    r.riskScore < delayThreshold && r.slaMinutes <= 480
  );

  const suggestions = safeRoutes.map((route, i) => {
    const driver = availableDrivers[i % availableDrivers.length];
    const vehicle = availableVehicles[i % availableVehicles.length];
    return {
      origin: route.origin,
      destination: route.destination,
      slaMinutes: route.slaMinutes,
      riskScore: route.riskScore,
      suggestedDriver: driver?.name,
      suggestedVehicle: vehicle?.id
    };
  });

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🧠 Trip Planner AI</h2>
      {suggestions.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {suggestions.map((s, i) => (
            <li key={i}>
              {s.origin} → {s.destination} | SLA: {s.slaMinutes} min | Risk: {s.riskScore}<br />
              Driver: {s.suggestedDriver} | Vehicle: {s.suggestedVehicle}
            </li>
          ))}
        </ul>
      ) : (
        <p>No safe trip plans available based on current fleet conditions.</p>
      )}
    </div>
  );
}