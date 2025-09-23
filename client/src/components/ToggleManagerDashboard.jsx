import React, { useEffect, useState } from 'react';

export default function ToggleManagerDashboard() {
  const [toggles, setToggles] = useState([]);

  useEffect(() => {
    fetch('/api/toggles')
      .then(res => res.json())
      .then(data => setToggles(data));
  }, []);

  const handleToggle = async (id, currentState) => {
    const res = await fetch(`/api/toggles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !currentState })
    });

    if (res.ok) {
      const updated = toggles.map(t =>
        t.id === id ? { ...t, enabled: !currentState } : t
      );
      setToggles(updated);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">🧩 Toggle Manager</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Feature</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Toggle</th>
          </tr>
        </thead>
        <tbody>
          {toggles.map((t, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{t.feature}</td>
              <td className="px-4 py-2">{t.enabled ? '✅ Enabled' : '❌ Disabled'}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleToggle(t.id, t.enabled)}
                  className={`px-3 py-1 rounded ${
                    t.enabled ? 'bg-red-600' : 'bg-green-600'
                  } text-white`}
                >
                  {t.enabled ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}