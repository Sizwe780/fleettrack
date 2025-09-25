import React from 'react';

export default function ESGExportPanel({ metrics }) {
  return (
    <div className="p-4 bg-slate-100 rounded shadow text-sm">
      <h4 className="font-semibold mb-2">📤 ESG Metrics</h4>
      <p>🌱 Emissions Reduction: {metrics.emissions}%</p>
      <p>👥 Community Impact: {metrics.communityScore}</p>
      <p>🛡️ Governance Compliance: {metrics.governanceScore}%</p>
      <button className="mt-2 px-4 py-2 bg-navy text-white rounded">Export ESG Report</button>
    </div>
  );
}