import React, { useEffect, useState } from 'react';

export default function LogsheetAutoFill({ tripId }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      const entry = { time: now, status: 'Driving' };
      setEntries(prev => [...prev, entry]);
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 text-xs bg-white p-3 rounded shadow">
      <h4 className="font-semibold mb-2">📋 Auto-Filled Logsheet</h4>
      <ul className="space-y-1">
        {entries.map((e, i) => (
          <li key={i}>{e.time} — {e.status}</li>
        ))}
      </ul>
    </div>
  );
}