import React from 'react';

export default function FleetTrackIncidentLog({ incidents = [] }) {
  return (
    <div className="mt-6 border rounded-xl p-4 bg-white shadow-md text-sm">
      <h2 className="text-lg font-bold mb-2">🚨 Incident Log</h2>

      {incidents.length === 0 ? (
        <p>No incidents reported for this trip.</p>
      ) : (
        <ul className="space-y-2">
          {incidents.map((incident, i) => {
            const time = incident.timestamp
              ? new Date(incident.timestamp.seconds * 1000).toLocaleString()
              : '—';
            const loc = incident.location
              ? `${incident.location.lat}, ${incident.location.lng}`
              : incident.location ?? '—';

            return (
              <li key={i} className="border-b pb-2">
                <p><strong>{incident.type}</strong> • <span className="text-red-600">{incident.severity}</span></p>
                <p>📍 Location: {loc}</p>
                <p>🕒 Time: {time}</p>
                <p>📝 Remarks: {incident.remarks?.join(', ') || '—'}</p>
                <p>👤 Reported by: {incident.driver_name}</p>
              </li>
            );
          })}
        </ul>
      )}

      {/* 🧪 Diagnostic Overlay */}
      <details className="bg-gray-50 p-2 rounded text-xs mt-3">
        <summary className="cursor-pointer font-semibold text-gray-700">📦 Incident Log Debug</summary>
        <pre className="overflow-x-auto mt-1">{JSON.stringify(incidents, null, 2)}</pre>
      </details>
    </div>
  );
}