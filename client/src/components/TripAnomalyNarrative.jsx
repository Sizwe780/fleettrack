import React from 'react';

export default function TripAnomalyNarrative({ trip }) {
  const narrative = [];

  if (trip.breachDetected) narrative.push(`Trip breached SLA at ${new Date(trip.breachTime).toLocaleString()}.`);
  if (trip.deviationDetected) narrative.push(`Route deviation occurred due to "${trip.deviationReason}".`);
  if (trip.idleAlerts?.length > 0) {
    const totalIdle = trip.idleAlerts.reduce((sum, a) => sum + (a.duration || 0), 0);
    narrative.push(`Idle time anomalies totaled ${totalIdle} minutes.`);
  }
  if (trip.incidents?.length > 0) {
    const types = trip.incidents.map(i => i.type).join(', ');
    narrative.push(`Incidents reported: ${types}.`);
  }

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📖 Trip Anomaly Narrative</h2>
      <p className="text-sm leading-relaxed">{narrative.join(' ') || '✅ No anomalies recorded for this trip.'}</p>
    </div>
  );
}