import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const snapshot = await getDocs(collection(db, 'audit_logs'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    };

    fetchLogs();
  }, []);

  const exportCSV = () => {
    const header = ['Timestamp', 'Actor', 'Action', 'TripID'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString('en-ZA'),
      log.actor,
      log.action,
      log.tripId ?? ''
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">📜 Audit Logs</h2>

      <button
        onClick={exportCSV}
        className="px-4 py-2 bg-green-600 text-white rounded-md mb-4"
      >
        Export Logs
      </button>

      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString('en-ZA')}</p>
            <p className="text-md">{log.actor} → {log.action}</p>
            {log.tripId && <p className="text-sm text-blue-600">Trip ID: {log.tripId}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogs;