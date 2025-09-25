import React from 'react';

export default function PublicFundingDashboard({ impact }) {
  return (
    <div className="p-4 bg-slate-100 rounded shadow text-sm">
      <h4 className="font-semibold mb-2">📤 Public-Sector Impact Metrics</h4>
      <p>🚚 Fleets Served: {impact.fleets}</p>
      <p>📦 Deliveries Completed: {impact.deliveries}</p>
      <p>🛡️ SLA Compliance: {impact.slaScore}%</p>
      <p>💰 Funding Potential: R{impact.fundingEstimate}</p>
      <button className="mt-2 px-4 py-2 bg-navy text-white rounded">Export Grant Report</button>
    </div>
  );
}