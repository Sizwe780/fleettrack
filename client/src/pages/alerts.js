import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const snapshot = await getDocs(collection(db, 'alerts'));
      const data = snapshot.docs.map(doc => doc.data());
      setAlerts(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    };

    fetchAlerts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">Fleet Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-gray-500">No alerts triggered recently.</p>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert, i) => (
            <li key={i} className={`p-4 rounded-md border ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
              <p className="font-semibold">{alert.driver} — Vehicle {alert.vehicleId}</p>
              <p>Score: {alert.score} ({alert.severity})</p>
              <p>Reason: {alert.reason.join(', ')}</p>
              <p className="text-sm text-gray-600">Triggered: {new Date(alert.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertsPage;