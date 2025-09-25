import React from 'react';

export default function TripDispatchForecast({ trip }) {
  const { analysis = {}, startTime } = trip;
  const fatigue = analysis.fatigueRisk || 0;
  const delay = analysis.delayRisk || 0;

  const recommendedHour = fatigue > 7 ? 6 : delay > 7 ? 10 : 8;
  const dispatchTime = new Date(startTime);
  dispatchTime.setHours(recommendedHour);
  dispatchTime.setMinutes(0);

  return (
    <section className="logsheet-section">
      <h2>🕒 Dispatch Forecast</h2>
      <p><strong>Recommended Dispatch Time:</strong> {dispatchTime.toLocaleTimeString()}</p>
      <p>{fatigue > 7 ? '⚠️ Early dispatch advised due to fatigue risk' : delay > 7 ? '⚠️ Mid-morning dispatch advised to avoid congestion' : '✅ Standard dispatch window recommended'}</p>
    </section>
  );
}