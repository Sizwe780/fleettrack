import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const DriverAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const alertsRef = collection(db, 'driver_alerts');
      const q = query(alertsRef, where('driver_uid', '==', user.uid));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlerts(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setLoading(false);
    };

    fetchAlerts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">🔔 Driver Alerts</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-600">{new Date(alert.timestamp).toLocaleString('en-ZA')}</p>
              <p className="text-md font-medium">{alert.message}</p>
              {alert.tripId && (
                <p className="text-sm text-blue-600 mt-1">Trip ID: {alert.tripId}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No alerts yet. You’re all caught up.</p>
      )}
    </div>
  );
};

export default DriverAlerts;