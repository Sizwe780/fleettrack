import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const snapshot = await getDocs(collection(db, 'notifications'));
      const data = snapshot.docs.map(doc => doc.data());
      setNotifications(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    };

    fetchNotifications();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">Notification Center</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications sent yet.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n, i) => (
            <li key={i} className={`p-4 border rounded-md ${n.severity === 'critical' ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}>
              <p className="text-sm text-gray-600">{new Date(n.timestamp).toLocaleString()}</p>
              <p><strong>{n.title}</strong></p>
              <p>{n.body}</p>
              <p className="text-sm text-gray-500">Sent to: {n.recipient_name}</p>
              {n.tripId && (
                <p className="text-xs text-blue-600">Trip ID: {n.tripId}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;