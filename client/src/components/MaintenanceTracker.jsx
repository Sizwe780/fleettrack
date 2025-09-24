import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export default function MaintenanceTracker({ vehicleId }) {
  const [issue, setIssue] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async () => {
    setStatus('saving');
    try {
      const payload = {
        vehicleId,
        issue,
        scheduledDate,
        reportedAt: new Date().toISOString(),
        status: 'pending',
      };

      await addDoc(collection(db, 'apps/fleet-track-app/maintenance'), payload);
      setIssue('');
      setScheduledDate('');
      setStatus('success');
    } catch (err) {
      console.error('MaintenanceTracker error:', err.message);
      setStatus('error');
    }
  };

  return (
    <div className="mt-10 max-w-xl mx-auto p-6 bg-white rounded shadow text-sm">
      <h2 className="text-xl font-bold mb-4">🛠️ Maintenance Tracker</h2>

      <input
        type="text"
        placeholder="Vehicle Issue"
        value={issue}
        onChange={e => setIssue(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="date"
        value={scheduledDate}
        onChange={e => setScheduledDate(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={!issue || !scheduledDate}
        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
      >
        Log Maintenance
      </button>

      {status === 'saving' && <p className="mt-2 text-xs text-gray-500">Saving issue...</p>}
      {status === 'success' && <p className="mt-2 text-xs text-green-600">Issue logged successfully!</p>}
      {status === 'error' && <p className="mt-2 text-xs text-red-600">Error logging issue.</p>}
    </div>
  );
}