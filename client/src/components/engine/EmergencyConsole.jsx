import React from 'react';
import { syncWithEmergencyUnits } from '../engines/EmergencySyncModule';

export default function EmergencyConsole({ trip }) {
  const sync = syncWithEmergencyUnits(trip);

  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-red-700 mb-2">🚨 Emergency Coordination Console</h3>
      <p className="text-sm text-gray-700 mb-2">Dispatch Code: <strong>{sync.dispatchCode}</strong></p>
      <ul className="list-disc ml-4 text-sm text-gray-700 mb-2">
        {sync.syncedUnits.map((unit, i) => <li key={i}>{unit}</li>)}
      </ul>
      <pre className="text-xs bg-gray-50 p-3 rounded whitespace-pre-wrap break-words">
        {JSON.stringify(sync.payload, null, 2)}
      </pre>
    </section>
  );
}