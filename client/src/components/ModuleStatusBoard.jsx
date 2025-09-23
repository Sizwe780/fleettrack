import React, { useEffect, useState } from 'react';

export default function ModuleStatusBoard() {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetch('/api/module-status')
      .then(res => res.json())
      .then(data => setModules(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">🩺 Module Status Board</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Module</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Last Ping</th>
            <th className="px-4 py-2">Latency</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{m.name}</td>
              <td className="px-4 py-2">{m.status}</td>
              <td className="px-4 py-2">{m.lastPing}</td>
              <td className="px-4 py-2">{m.latency}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}