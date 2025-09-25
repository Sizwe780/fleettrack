import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function FleetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'apps/fleet-track-app/alerts'), orderBy('timestamp', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlerts(all);
      setLoading(false);
    }, (err) => {
      console.error('Alert listener failed:', err.message);
      setError('Failed to load alerts.');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-navy mb-4">🔔 Fleet Alerts</h3>

      {loading ? (
        <p className="text-gray-600">Loading alerts...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : alerts.length === 0 ? (
        <p className="text-gray-500 italic">✅ All clear. No active alerts.</p>
      ) : (
        <ul className="space-y-4">
          {alerts.map(alert => (
            <li key={alert.id} className="border border-gray-300 rounded shadow-md p-4 bg-white">
              <div className="flex justify-between items-center mb-2">
                <span className={`px-2 py-1 rounded text-sm font-semibold ${getBadgeStyle(alert.type)}`}>
                  {getIcon(alert.type)} {alert.type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
              </div>
              <p className="text-gray-800">{alert.message}</p>
              {alert.tripId && (
                <p className="text-sm text-blue-600 mt-1">Trip ID: {alert.tripId}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getBadgeStyle(type) {
  switch (type) {
    case 'sla': return 'bg-red-100 text-red-700';
    case 'risk': return 'bg-yellow-100 text-yellow-700';
    case 'status': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getIcon(type) {
  switch (type) {
    case 'sla': return '⚠️';
    case 'risk': return '🧪';
    case 'status': return '📍';
    default: return 'ℹ️';
  }
}

function formatTime(timestamp) {
  try {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return '—';
  }
}