export default function FleetPulseAI({ fleetStats }) {
    const fatigueRisk = fleetStats.avgTripsPerDriver > 20 && fleetStats.avgHealthScore < 60;
    const maintenanceRisk = fleetStats.totalViolations > 50;
  
    return (
      <div className="bg-white p-4 rounded-xl shadow-md mt-6">
        <h3 className="text-lg font-bold mb-2">🧠 Fleet Pulse AI</h3>
        <p className="text-sm">
          Fatigue Risk: {fatigueRisk ? '⚠️ High' : '✅ Low'}  
          <br />
          Maintenance Risk: {maintenanceRisk ? '⚠️ Elevated' : '✅ Stable'}
        </p>
      </div>
    );
  }