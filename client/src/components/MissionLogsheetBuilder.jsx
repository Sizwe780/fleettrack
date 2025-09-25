import React from 'react';

export default function MissionLogsheetBuilder({ events }) {
  return (
    <div className="mt-6 p-4 bg-white rounded shadow text-xs">
      <h4 className="font-semibold mb-2">📋 Mission Logsheet</h4>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Time</th>
            <th className="border px-2 py-1">Velocity</th>
            <th className="border px-2 py-1">Fuel</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{new Date(e.timestamp).toLocaleString()}</td>
              <td className="border px-2 py-1">{Math.round(e.velocity)} km/h</td>
              <td className="border px-2 py-1">{Math.round(e.fuelLevel)}%</td>
              <td className="border px-2 py-1">{e.systemStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}