import React from 'react';

export default function MissionAlertOverlay({ fatigueRisk, failureRisk, landingStatus }) {
  return (
    <div className="mt-4 p-3 bg-red-50 rounded text-sm space-y-2">
      {fatigueRisk === 'critical' && <p>🚨 Crew fatigue risk: <strong>Critical</strong></p>}
      {failureRisk === 'critical' && <p>🚨 System failure risk: <strong>Critical</strong></p>}
      {landingStatus === 'Landed' && <p>🛬 Mission status: <strong>Landed safely</strong></p>}
    </div>
  );
}