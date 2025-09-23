import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function AuditViewer() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const path = `apps/fleet-track-app/auditLogs`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const entries = snapshot.docs.map(doc => doc.data());
      const sorted = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(sorted);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">🧾 Audit Trail Viewer</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">No audit logs found.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {logs.map((log, i) => (
            <li key={i} className="border p-3 rounded-md bg-gray-50">
              <p><strong>Action:</strong> {log.action}</p>
              <p><strong>Actor:</strong> {log.actor}</p>
              <p><strong>Role:</strong> {log.role ?? '—'}</p>
              <p><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</p>
              {log.reason && <p><strong>Reason:</strong> {log.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}