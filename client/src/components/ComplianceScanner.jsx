import React from 'react';

export default function ComplianceScanner({ trips }) {
  const flaggedTrips = trips.map(t => {
    const issues = [];

    if (!t.origin) issues.push('Missing origin');
    if (!t.destination) issues.push('Missing destination');
    if (!t.departureTime) issues.push('Missing departure time');
    if (!t.odometer_start || t.odometer_start <= 0) issues.push('Invalid odometer');
    if (!t.createdAt) issues.push('Missing timestamp');

    const created = new Date(t.createdAt);
    const departed = new Date(t.departureTime);
    const delayMs = departed - created;
    if (delayMs > 3600000) issues.push('Late submission');

    return {
      id: t.id || 'Unknown',
      driver: t.driver_name || 'Unknown',
      vehicle: t.vehicle_id || 'Unknown',
      status: t.status || 'Unknown',
      issues,
      compliant: issues.length === 0,
    };
  });

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📋 Compliance Scanner</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th>Trip ID</th>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Issues</th>
            <th>Compliance</th>
          </tr>
        </thead>
        <tbody>
          {flaggedTrips.map((t, i) => (
            <tr key={i} className="border-b">
              <td>{t.id}</td>
              <td>{t.driver}</td>
              <td>{t.vehicle}</td>
              <td>{t.status}</td>
              <td className="text-red-600">{t.issues.join(', ') || 'None'}</td>
              <td className={t.compliant ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {t.compliant ? '✅ Compliant' : '⚠️ Flagged'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}