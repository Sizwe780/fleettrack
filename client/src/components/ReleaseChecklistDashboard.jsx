import React, { useEffect, useState } from 'react';

export default function ReleaseChecklistDashboard() {
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    fetch('/api/release-checklist')
      .then(res => res.json())
      .then(data => setChecklist(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">🧪 FleetTrack v3.0 Release Checklist</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Module</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Last Verified</th>
            <th className="px-4 py-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {checklist.map((item, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{item.module}</td>
              <td className="px-4 py-2">{item.status}</td>
              <td className="px-4 py-2">{item.verifiedAt}</td>
              <td className="px-4 py-2">{item.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}