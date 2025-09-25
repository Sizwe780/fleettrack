import React from 'react';

export default function InvestorExportDashboard({ metrics }) {
  return (
    <div className="p-4 bg-slate-100 rounded shadow text-sm">
      <h4 className="font-semibold mb-2">📤 Investor Export Metrics</h4>
      <p>✅ SLA Compliance: {metrics.slaScore}%</p>
      <p>📦 Cargo Integrity: {metrics.cargoHealth}%</p>
      <p>🧾 Audit Readiness: {metrics.auditScore}%</p>
      <p>💰 Revenue per Trip: R{metrics.revenuePerTrip}</p>
      <button className="mt-2 px-4 py-2 bg-navy text-white rounded">Export Deck</button>
    </div>
  );
}