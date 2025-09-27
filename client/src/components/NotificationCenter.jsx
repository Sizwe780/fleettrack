import React, { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { auth } from '../firebase';

export default function NotificationCenter() {
  const [permission, setPermission] = useState(Notification.permission);
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([]);

  const messaging = auth?.app ? getMessaging(auth.app) : null;

  const requestPermission = async () => {
    try {
      const status = await Notification.requestPermission();
      setPermission(status);

      if (status === 'granted' && messaging) {
        const fcmToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });
        setToken(fcmToken);
        console.log('[NotificationCenter] FCM Token:', fcmToken);
      }
    } catch (err) {
      console.error('[NotificationCenter] Permission error:', err.message);
    }
  };

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[NotificationCenter] FCM message received:', payload);
      setMessages((prev) => [...prev, payload.notification]);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, [messaging]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow text-sm">
      <h2 className="text-xl font-bold mb-4">🔔 Notification Center</h2>

      {permission !== 'granted' ? (
        <button
          onClick={requestPermission}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enable Notifications
        </button>
      ) : (
        <p className="text-green-600 mb-2">✅ Notifications enabled</p>
      )}

      {token && (
        <div className="text-xs text-gray-600 mb-4">
          <strong>FCM Token:</strong> {token}
        </div>
      )}

      {messages.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">📬 Recent Messages</h4>
          <ul className="space-y-2">
            {messages.map((msg, i) => (
              <li key={i} className="bg-gray-50 p-2 rounded border">
                <p><strong>{msg.title}</strong></p>
                <p className="text-xs text-gray-700">{msg.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}