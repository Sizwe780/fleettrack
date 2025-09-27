import React from "react";

export default function FleetCoreAudit({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-700">Audit Trail</h4>
        <p className="text-sm text-yellow-800">No audit data available.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-2">Audit Trail</h4>
      <ul className="space-y-2 text-sm text-gray-800">
        {data.map((entry, index) => (
          <li key={index} className="border-b border-gray-300 pb-2">
            <strong>{entry.action}</strong> {entry.amount} of {entry.pair}  
            <span className="ml-2 text-xs text-gray-500">
              @ {new Date(entry.timestamp).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}