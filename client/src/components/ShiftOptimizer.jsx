import React, { useEffect, useState } from 'react';

export default function ShiftOptimizer() {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch('/api/shift-optimize')
      .then(res => res.json())
      .then(data => setSuggestions(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">🧠 Shift Optimizer</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Driver</th>
            <th className="px-4 py-2">Suggested Shift</th>
            <th className="px-4 py-2">Fatigue Risk</th>
          </tr>
        </thead>
        <tbody>
          {suggestions.map((s, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{s.driver}</td>
              <td className="px-4 py-2">{s.shift}</td>
              <td className="px-4 py-2">{s.risk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}