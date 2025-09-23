import React from 'react';

const ComplianceSummary = ({ trip }) => {
  const remarks = trip.analysis?.remarks?.split('.').map(r => r.trim()).filter(Boolean) ?? [];
  const cycleUsed = parseFloat(trip.cycleUsed ?? '0');
  const violations = [];

  // 🔍 Flag HOS cycle usage
  if (cycleUsed >= 70) {
    violations.push(`🛑 Cycle limit exceeded: ${cycleUsed}/70 hrs`);
  } else if (cycleUsed >= 65) {
    violations.push(`⚠️ Cycle nearing limit: ${cycleUsed}/70 hrs`);
  } else {
    violations.push(`✅ Cycle usage: ${cycleUsed}/70 hrs`);
  }

  // 🔍 Flag driving time violations
  const drivingSegments = trip.dailyLogs?.filter(log => log.status === 'Driving') ?? [];
  const totalDriving = drivingSegments.reduce((sum, seg) => sum + (seg.duration ?? 0), 0);
  if (totalDriving > 11) {
    violations.push(`🛑 Driving exceeded 11 hrs: ${totalDriving.toFixed(1)} hrs`);
  } else {
    violations.push(`✅ Driving within limit: ${totalDriving.toFixed(1)} hrs`);
  }

  // 🔍 Flag rest breaks
  const restTaken = remarks.find(r => r.toLowerCase().includes('rest'));
  if (restTaken) {
    violations.push(`✅ Rest break logged: ${restTaken}`);
  } else {
    violations.push(`⚠️ No rest break detected`);
  }

  // 🔍 Flag fueling
  const fuelEvent = remarks.find(r => r.toLowerCase().includes('fuel'));
  if (fuelEvent) {
    violations.push(`✅ Fuel stop logged: ${fuelEvent}`);
  } else {
    violations.push(`⚠️ No fuel stop recorded`);
  }

  // 🔍 Pickup/Drop-off
  const pickup = remarks.find(r => r.toLowerCase().includes('pickup'));
  const dropoff = remarks.find(r => r.toLowerCase().includes('drop'));
  if (pickup && dropoff) {
    violations.push(`✅ Pickup and drop-off logged`);
  } else {
    violations.push(`⚠️ Missing pickup/drop-off event`);
  }

  return (
    <div className="border rounded-xl p-4 bg-white shadow-md mb-6">
      <h2 className="text-lg font-bold mb-2">🚦 Compliance Summary</h2>
      <ul className="list-disc ml-4 text-sm space-y-1">
        {violations.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>
    </div>
  );
};

export default ComplianceSummary;