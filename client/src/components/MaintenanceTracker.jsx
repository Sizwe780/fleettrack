import React from 'react';

const MaintenanceTracker = ({ trips }) => {
  const dueAssets = trips.filter(t => {
    const km = t.analysis?.odometerKm ?? 0;
    const lastService = t.analysis?.lastServiceKm ?? 0;
    return km - lastService >= 10000;
  });

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">🛠️ Maintenance Alerts</h2>
      {dueAssets.length === 0 ? (
        <p className="text-sm text-gray-500">No assets due for service.</p>
      ) : (
        <ul className="list-disc ml-4 text-sm space-y-1">
          {dueAssets.map((t, i) => (
            <li key={i}>
              {t.driver_name} — {t.vehicleId} @ {t.analysis?.odometerKm}km (Last service: {t.analysis?.lastServiceKm}km)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MaintenanceTracker;