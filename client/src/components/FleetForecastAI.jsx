import React from 'react';

export default function FleetForecastAI({ historicalTrips }) {
  const forecastDays = 7;
  const today = new Date();
  const forecasts = [];

  for (let i = 0; i < forecastDays; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    const dayLabel = day.toLocaleDateString();

    const dayTrips = historicalTrips.filter(t => {
      const tripDate = new Date(t.startTime).getDate();
      return tripDate === day.getDate();
    });

    const breachRate = dayTrips.filter(t => t.breachDetected).length / (dayTrips.length || 1);
    const avgFuel = (dayTrips.reduce((sum, t) => sum + (t.analysis?.fuelRisk || 0), 0) / (dayTrips.length || 1)).toFixed(2);
    const avgDelay = (dayTrips.reduce((sum, t) => sum + (t.analysis?.delayRisk || 0), 0) / (dayTrips.length || 1)).toFixed(2);

    forecasts.push({
      day: dayLabel,
      breachRate: (breachRate * 100).toFixed(1),
      avgFuel,
      avgDelay
    });
  }

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🔮 Fleet Forecast (Next 7 Days)</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>SLA Breach %</th>
            <th>Avg Fuel Risk</th>
            <th>Avg Delay Risk</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map((f, i) => (
            <tr key={i}>
              <td>{f.day}</td>
              <td>{f.breachRate}%</td>
              <td>{f.avgFuel}</td>
              <td>{f.avgDelay}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}