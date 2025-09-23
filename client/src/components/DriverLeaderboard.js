import React, { useEffect, useState } from 'react';

export default function DriverLeaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setLeaders(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">🏆 Driver Leaderboard</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Driver</th>
            <th className="px-4 py-2">Trips</th>
            <th className="px-4 py-2">Compliance</th>
            <th className="px-4 py-2">Incidents</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((d, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{d.name}</td>
              <td className="px-4 py-2">{d.trips}</td>
              <td className="px-4 py-2">{d.compliance}%</td>
              <td className="px-4 py-2">{d.incidents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}