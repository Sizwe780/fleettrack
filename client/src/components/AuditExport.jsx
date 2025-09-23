import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function AuditExport() {
  const [exportData, setExportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'apps/fleet-track-app/auditLogs'));
      const logs = snapshot.docs.map(doc => doc.data());

      setExportData(logs);
      // You can pass logs to a CSV/JSON formatter here
    } catch (err) {
      console.error('Audit export error:', err);
      setExportData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border mb-6">
      <h2 className="text-xl font-bold mb-4">🧾 Compliance Export</h2>
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Generate Export
      </button>

      {loading && <p className="text-sm text-gray-500 mt-2">Preparing export...</p>}

      {exportData.length > 0 && (
        <div className="mt-4 text-sm">
          <p className="font-semibold mb-2">Audit Entries:</p>
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {exportData.map((entry, i) => (
              <li key={i} className="bg-gray-100 p-2 rounded">
                <strong>{entry.action}</strong> by {entry.actor} on{' '}
                {new Date(entry.timestamp).toLocaleString()}
                <br />
                <span className="italic text-gray-700">{entry.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}