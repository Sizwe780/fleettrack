import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function NotificationCenter({ userId, role }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const path = `apps/fleet-track-app/users/${userId}/notifications`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const entries = snapshot.docs.map(doc => doc.data());
      const sorted = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(sorted);
    });

    return () => unsubscribe();
  }, [userId]);

  const filtered = notifications.filter(n => {
    if (role === 'driver') return n.type === 'trip-update';
    if (role === 'admin') return true;
    if (role === 'compliance') return n.type === 'audit' || n.type === 'flag';
    return false;
  });

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border mb-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔔 Notification Center</h2>
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((note, i) => (
            <li key={i} className="bg-gray-50 p-3 rounded-md border">
              <p className="text-sm font-semibold">{note.title}</p>
              <p className="text-xs text-gray-600">{note.body}</p>
              <p className="text-xs text-gray-400">
                {new Date(note.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}