export default function ComplianceDashboard({ fleetStats }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md mt-6">
        <h3 className="text-xl font-bold mb-4">🧾 Compliance Dashboard</h3>
        <ul className="text-sm space-y-2">
          <li>✅ Avg Fleet Score: {fleetStats.avgHealthScore}/100</li>
          <li>🚨 Flagged Trips: {fleetStats.flaggedTrips}</li>
          <li>📉 Break Violations: {fleetStats.breakViolations}</li>
          <li>🧭 Route Deviations: {fleetStats.routeDeviations}</li>
          <li>🧠 Fatigue Risk Drivers: {fleetStats.fatigueRiskDrivers}</li>
        </ul>
      </div>
    );
  }