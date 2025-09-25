import React from 'react';

export default function TripIncidentTimeline({ trip }) {
  const events = [];

  if (trip.breachDetected) {
    events.push({
      label: "SLA Breach",
      time: trip.breachTime,
      severity: "High"
    });
  }

  if (trip.deviationDetected) {
    events.push({
      label: `Route Deviation: ${trip.deviationReason}`,
      time: trip.deviationTime,
      severity: "Medium"
    });
  }

  if (trip.idleAlerts?.length > 0) {
    trip.idleAlerts.forEach((a) => {
      events.push({
        label: `Idle Time: ${a.duration} min`,
        time: a.flaggedAt,
        severity: "Low"
      });
    });
  }

  if (trip.incidents?.length > 0) {
    trip.incidents.forEach((i) => {
      events.push({
        label: `Incident: ${i.type}`,
        time: i.time,
        severity: i.severity || "Medium"
      });
    });
  }

  const sorted = events.sort((a, b) => new Date(a.time) - new Date(b.time));

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📍 Trip Incident Timeline</h2>
      {sorted.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {sorted.map((e, i) => (
            <li key={i}>
              <strong>{e.label}</strong> — {new Date(e.time).toLocaleString()} ({e.severity})
            </li>
          ))}
        </ul>
      ) : (
        <p>No incidents or anomalies recorded for this trip.</p>
      )}
    </div>
  );
}