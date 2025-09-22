import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const AuditPage = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const snapshot = await getDocs(collection(db, 'logs'));
      const data = snapshot.docs.map(doc => doc.data());
      setLogs(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    };

    fetchLogs();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">Audit Logs</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500">No logs recorded yet.</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log, i) => (
            <li key={i} className="p-4 border rounded-md bg-gray-50">
              <p className="font-semibold">{log.actor_name}</p>
              <p className="text-sm text-gray-600">
                {new Date(log.timestamp).toLocaleString()}
              </p>
              <p className="mt-1">
                <strong>{log.action}</strong> — {log.target}
              </p>
              {log.details && (
                <pre className="text-xs mt-1 bg-gray-100 p-2 rounded">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuditPage;