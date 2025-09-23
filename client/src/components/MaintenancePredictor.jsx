import React from 'react';

const MaintenancePredictor = ({ vehicleStats = {} }) => {
  const {
    lastServiceDate = 'Unknown',
    mileageSinceService = 0,
    totalTrips = 0,
    flaggedIssues = []
  } = vehicleStats;

  const needsService = mileageSinceService > 10000 || flaggedIssues.length > 0;
  const serviceUrgency = mileageSinceService > 15000 ? 'critical' : mileageSinceService > 10000 ? 'high' : 'normal';

  const urgencyColor = {
    normal: 'bg-green-100 text-green-700',
    high: 'bg-yellow-100 text-yellow-700',
    critical: 'bg-red-100 text-red-700'
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-xl shadow-md border">
      <h3 className="text-lg font-semibold mb-2">Maintenance Predictor</h3>
      <div className={`px-3 py-2 rounded ${urgencyColor[serviceUrgency]}`}>
        Service Status: {needsService ? serviceUrgency.toUpperCase() : 'OK'}
      </div>
      <ul className="mt-2 text-sm text-gray-700 space-y-1">
        <li>Last Service: {lastServiceDate}</li>
        <li>Mileage Since Service: {mileageSinceService} km</li>
        <li>Total Trips: {totalTrips}</li>
        {flaggedIssues.length > 0 && (
          <li>
            Flagged Issues:
            <ul className="list-disc ml-4">
              {flaggedIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </div>
  );
};

export default MaintenancePredictor;