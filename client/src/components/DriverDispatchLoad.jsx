import React from 'react';

export default function DriverDispatchLoad({ trips }) {
  const load = {};

  trips.forEach(t => {
    const name = t.driverName || 'Unknown';
    if (!load[name]) load[name] = 0;
    load[name] += 1;
  });

  const ranked = Object.entries(load).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📦 Driver Dispatch Load</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Driver</th><th>Trips Dispatched</th></tr></thead>
        <tbody>
          {ranked.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}