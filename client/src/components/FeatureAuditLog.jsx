import React, { useEffect, useState } from 'react';

export default function FeatureAuditLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/feature-audit')
      .then(res => res.json())
      .then(data => setLogs(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">🧾 Feature Audit Log</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Timestamp</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Feature</th>
            <th className="px-4 py-2">Performed By</th>
            <th className="px-4 py-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{log.timestamp}</td>
              <td className="px-4 py-2">{log.action}</td>
              <td className="px-4 py-2">{log.feature}</td>
              <td className="px-4 py-2">{log.user}</td>
              <td className="px-4 py-2">{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}