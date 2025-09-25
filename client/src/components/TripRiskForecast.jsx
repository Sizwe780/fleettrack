import React from 'react';

export default function TripRiskForecast({ trip }) {
  const { analysis = {}, breachDetected, deviationDetected, incidents = [] } = trip;
  let risk = 0;

  if (analysis.fuelRisk > 7) risk += 20;
  if (analysis.fatigueRisk > 7) risk += 25;
  if (analysis.delayRisk > 7) risk += 25;
  if (breachDetected) risk += 15;
  if (deviationDetected) risk += 10;
  if (incidents.length > 2) risk += 10;

  const forecast = Math.min(risk, 100);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🔮 Trip Risk Forecast</h2>
      <p><strong>Predicted Risk:</strong> {forecast}%</p>
      <p>{forecast > 70 ? '⚠️ High risk — dispatch review recommended' : '✅ Risk within acceptable range'}</p>
    </div>
  );
}