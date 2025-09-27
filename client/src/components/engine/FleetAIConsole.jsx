import React, { useEffect, useState } from 'react';
import { QuantumExecutionKernel } from '../engines/QuantumExecutionKernel';
import mockPayload from '../mock/mockPayload';

export default function FleetAIConsole() {
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    QuantumExecutionKernel(mockPayload).then(setSnapshot);
  }, []);

  if (!snapshot) return <p className="text-sm text-gray-500">Running quantum engines…</p>;

  return (
    <section className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-navy mb-4">🧠 FleetAI Quantum Snapshot</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-sm">
        {Object.entries(snapshot).map(([key, value]) => (
          <div key={key} className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-navy mb-1">{key}</p>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}