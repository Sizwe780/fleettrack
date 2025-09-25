import React from 'react';

export default function FleetAnomalyScanner({ trips }) {
  const anomalies = [];

  trips.forEach((trip) => {
    const issues = [];

    if (!trip.tripId || !trip.origin || !trip.destination) {
      issues.push("Missing core identifiers");
    }

    if (!trip.startTime || !trip.endTime || !trip.duration || trip.duration <= 0) {
      issues.push("Invalid or missing time data");
    }

    if (trip.fuelUsed > 200 || trip.duration > 24) {
      issues.push("Extreme fuel or duration values");
    }

    if (trip.analysis?.delayRisk > 9 || trip.analysis?.fatigueRisk > 9) {
      issues.push("High behavioral risk");
    }

    if (!trip.driverSignature && trip.exportedAt) {
      issues.push("Exported without signature");
    }

    if (trip.metadataFlags?.length > 3) {
      issues.push("Multiple metadata issues");
    }

    if (issues.length > 0) {
      anomalies.push({
        tripId: trip.tripId,
        vehicleId: trip.vehicleId,
        driverName: trip.driverName,
        issues
      });
    }
  });

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🚨 Fleet Anomaly Scanner</h2>
      {anomalies.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {anomalies.map((a, i) => (
            <li key={i}>
              <strong>{a.tripId}</strong> — {a.driverName} ({a.vehicleId})<br />
              {a.issues.map((issue, j) => (
                <span key={j}>❌ {issue}<br /></span>
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <p>✅ No anomalies detected across current fleet logsheets.</p>
      )}
    </div>
  );
}