import React from 'react';

export default function TripRiskNarrative({ trip }) {
  const {
    tripId, origin, destination, driverName,
    breachDetected, breachTime,
    deviationDetected, deviationReason, deviationTime,
    incidents = [], idleAlerts = [],
    analysis = {}
  } = trip;

  const narrative = [];

  narrative.push(`Trip ${tripId} from ${origin} to ${destination} was operated by ${driverName || 'Unknown'}.`);

  if (breachDetected) {
    narrative.push(`An SLA breach occurred at ${new Date(breachTime).toLocaleString()}, triggering compliance alerts.`);
  }

  if (deviationDetected) {
    narrative.push(`The route was deviated at ${new Date(deviationTime).toLocaleString()} due to "${deviationReason}".`);
  }

  if (idleAlerts.length > 0) {
    const totalIdle = idleAlerts.reduce((sum, a) => sum + (a.duration || 0), 0);
    narrative.push(`Idle time anomalies were flagged, totaling ${totalIdle} minutes across checkpoints.`);
  }

  if (incidents.length > 0) {
    const incidentDetails = incidents.map(i => `${i.type} at ${new Date(i.time).toLocaleString()}`).join('; ');
    narrative.push(`Reported incidents include: ${incidentDetails}.`);
  }

  if (analysis.fatigueRisk > 7) {
    narrative.push(`Driver fatigue risk was elevated (score: ${analysis.fatigueRisk}), suggesting dispatch review.`);
  }

  if (analysis.delayRisk > 7) {
    narrative.push(`Delay risk was high (score: ${analysis.delayRisk}), impacting SLA compliance.`);
  }

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📖 Trip Risk Narrative</h2>
      <p className="text-sm leading-relaxed">{narrative.join(' ')}</p>
    </div>
  );
}