import React from 'react';

export default function TenderTraceabilityEngine({ trips, contracts }) {
  const contractMap = {};
  contracts?.forEach(c => {
    contractMap[c.id] = c;
  });

  const tracedTrips = trips.map(t => {
    const contract = contractMap[t.contractId];
    const issues = [];

    if (!t.contractId) issues.push('Missing contract ID');
    if (!t.milestone) issues.push('Missing milestone');
    if (!t.deliveryTime) issues.push('Missing delivery timestamp');

    let slaBreached = false;
    if (contract && t.deliveryTime && t.departureTime) {
      const departed = new Date(t.departureTime);
      const delivered = new Date(t.deliveryTime);
      const durationHrs = (delivered - departed) / 3600000;
      if (durationHrs > contract.slaHours) {
        issues.push(`SLA breach: ${durationHrs.toFixed(1)}h > ${contract.slaHours}h`);
        slaBreached = true;
      }
    }

    return {
      id: t.id || 'Unknown',
      driver: t.driver_name || 'Unknown',
      contractId: t.contractId || '—',
      milestone: t.milestone || '—',
      status: t.status || '—',
      deliveryTime: t.deliveryTime || '—',
      issues,
      slaBreached,
    };
  });

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📦 Tender Traceability Engine</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th>Trip ID</th>
            <th>Driver</th>
            <th>Contract</th>
            <th>Milestone</th>
            <th>Status</th>
            <th>Delivery</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {tracedTrips.map((t, i) => (
            <tr key={i} className="border-b">
              <td>{t.id}</td>
              <td>{t.driver}</td>
              <td>{t.contractId}</td>
              <td>{t.milestone}</td>
              <td>{t.status}</td>
              <td>{t.deliveryTime}</td>
              <td className={t.slaBreached ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {t.issues.join(', ') || '✅ OK'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}