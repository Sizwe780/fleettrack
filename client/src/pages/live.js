import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const LiveMonitor = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubTrips = onSnapshot(collection(db, 'trips'), (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        const type = change.type;
        const message = `${type.toUpperCase()} Trip: ${data.origin} → ${data.destination}`;
        logEvent(message, data.driver_name);
      });
    });

    const unsubAlerts = onSnapshot(collection(db, 'alerts'), (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        const message = `ALERT: ${data.driver} triggered ${data.severity} score (${data.score})`;
        logEvent(message, data.driver);
      });
    });

    return () => {
      unsubTrips();
      unsubAlerts();
    };
  }, []);

  const logEvent = (message, actor) => {
    setEvents(prev => [
      { message, actor, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 49) // keep last 50 events
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">Live Fleet Monitor</h2>
      <ul className="space-y-2">
        {events.map((e, i) => (
          <li key={i} className="p-3 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-600">{e.timestamp}</p>
            <p><strong>{e.actor}</strong>: {e.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveMonitor;