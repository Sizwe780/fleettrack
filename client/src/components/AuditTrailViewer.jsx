import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function AuditTrailViewer({ trip }) {
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    if (!trip?.id) return;

    const path = `apps/fleet-track-app/trips/${trip.id}/auditTrail`;
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sorted = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setTrail(sorted);
      },
      (error) => {
        console.error('AuditTrailViewer error:', error.message);
      }
    );

    return () => unsubscribe();
  }, [trip?.id]);

  if (trail.length === 0) {
    return <p className="text-sm text-gray-500 mt-2">No audit trail found for this trip.</p>;
  }

  return (
    <div className="mt-4 text-sm">
      <h4 className="font-semibold mb-2">📜 Audit Trail</h4>
      <ul className="space-y-2">
        {trail.map(entry => (
          <li key={entry.id} className="bg-gray-50 p-2 rounded border">
            <p><strong>{entry.action}</strong></p>
            <p className="text-xs text-gray-600">
              By <span className="font-mono">{entry.actor}</span> @ {new Date(entry.timestamp).toLocaleString()}
            </p>
            {entry.reason && (
              <p className="text-xs text-gray-700 mt-1">📝 Reason: {entry.reason}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}