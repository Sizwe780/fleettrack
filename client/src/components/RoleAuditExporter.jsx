import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function RoleAuditExporter() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const snapshot = await getDocs(collection(db, 'apps/fleet-track-app/auditLogs'));
      const entries = snapshot.docs.map(doc => doc.data());
      const filtered = entries.filter(log => log.action.includes('role'));
      setLogs(filtered);
    };
    fetchLogs();
  }, []);

  const exportCSV = () => {
    const header = ['Action', 'Actor', 'Role', 'Timestamp'];
    const rows = logs.map(log => [
      log.action,
      log.actor,
      log.role ?? '—',
      new Date(log.timestamp).toLocaleString()
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'role-audit-log.csv';
    link.click();
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">🧾 Role Audit Exporter</h2>
      <button onClick={exportCSV} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        📤 Export CSV
      </button>
      <ul className="space-y-2 text-sm">
        {logs.map((log, i) => (
          <li key={i} className="border p-3 rounded bg-gray-50">
            <p><strong>{log.action}</strong> by {log.actor}</p>
            <p>Role: {log.role ?? '—'}</p>
            <p>{new Date(log.timestamp).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}