import React from 'react';

export default function EnterpriseAnalyticsDashboard({ metrics }) {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded shadow text-sm">
      <h4 className="font-semibold mb-2">📊 Fleet Performance</h4>
      <p>✅ SLA Compliance: {metrics.slaScore}%</p>
      <p>🚧 Risk Zones: {metrics.riskZones}</p>
      <p>📦 Deliveries Completed: {metrics.deliveries}</p>
      <p>🧾 Payroll Bundles Generated: {metrics.payrollBundles}</p>
    </div>
  );
}