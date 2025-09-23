import React, { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const IncidentReporter = ({ tripId }) => {
  const [form, setForm] = useState({
    type: 'Breakdown',
    severity: 'Moderate',
    location: '',
    remarks: '',
  });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setForm((prev) => ({ ...prev, location: loc }));
      },
      (err) => console.warn('Location error:', err.message)
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated.');

      const [lat, lng] = form.location.split(',').map(Number);
      const payload = {
        tripId,
        driver_uid: user.uid,
        driver_name: user.displayName ?? 'Unknown',
        type: form.type,
        severity: form.severity,
        location: { lat, lng },
        remarks: form.remarks ? [form.remarks] : [],
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'apps/fleet-track-app/incidents'), payload);
      setStatus('success');
      setForm({ type: 'Breakdown', severity: 'Moderate', location: '', remarks: '' });
    } catch (err) {
      console.error('Incident submission error:', err);
      setStatus('error');
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white shadow-md mt-6">
      <h2 className="text-lg font-bold mb-2">🚨 Report Incident</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label>Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            className="w-full border rounded px-3 py-2"
          >
            <option>Breakdown</option>
            <option>Delay</option>
            <option>Violation</option>
            <option>Route Deviation</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label>Severity</label>
          <select
            value={form.severity}
            onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}
            className="w-full border rounded px-3 py-2"
          >
            <option>Low</option>
            <option>Moderate</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
        <div>
          <label>Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="Auto-filled or enter manually"
          />
        </div>
        <div>
          <label>Remarks</label>
          <textarea
            value={form.remarks}
            onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Describe what happened..."
          />
        </div>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Incident'}
        </button>
        {status === 'success' && <p className="text-green-600 mt-2">Incident logged successfully.</p>}
        {status === 'error' && <p className="text-red-600 mt-2">Error submitting incident.</p>}
      </form>

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-3">
        <summary className="cursor-pointer font-semibold text-gray-700">📍 Incident Payload Debug</summary>
        <pre className="overflow-x-auto mt-1">{JSON.stringify(form, null, 2)}</pre>
      </details>
    </div>
  );
};

export default IncidentReporter;