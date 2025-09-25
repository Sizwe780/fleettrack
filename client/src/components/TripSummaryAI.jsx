import React from 'react';

export default function TripSummaryAI({ trip }) {
  const {
    tripId, origin, destination, driverName,
    startTime, endTime, duration,
    breachDetected, deviationDetected, deviationReason,
    incidents = [], idleAlerts = []
  } = trip;

  const summary = [];

  summary.push(`Trip ${tripId} was operated by ${driverName || 'Unknown'} from ${origin} to ${destination}.`);
  summary.push(`It started at ${new Date(startTime).toLocaleString()} and ended at ${new Date(endTime).toLocaleString()}, lasting ${duration} hours.`);

  if (breachDetected) summary.push(`An SLA breach was detected during the trip.`);
  if (deviationDetected) summary.push(`Route deviation occurred due to: ${deviationReason}.`);
  if (idleAlerts.length > 0) {
    const totalIdle = idleAlerts.reduce((sum, a) => sum + (a.duration || 0), 0);
    summary.push(`Idle time anomalies were flagged, totaling ${totalIdle} minutes.`);
  }
  if (incidents.length > 0) {
    const types = incidents.map(i => i.type).join(', ');
    summary.push(`Reported incidents include: ${types}.`);
  }

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📝 Trip Summary AI</h2>
      <p className="text-sm leading-relaxed">{summary.join(' ')}</p>
    </div>
  );
}