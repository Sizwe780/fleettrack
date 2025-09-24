import React, { useEffect, useState } from 'react';

export default function PatchRegistryViewer() {
  const [patches, setPatches] = useState([]);

  useEffect(() => {
    fetch('/api/patch-registry')
      .then(res => res.json())
      .then(data => setPatches(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">🧩 Patch Registry Viewer</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Patch ID</th>
            <th className="px-4 py-2">Module</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Toggle</th>
            <th className="px-4 py-2">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {patches.map((p, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{p.id}</td>
              <td className="px-4 py-2">{p.module}</td>
              <td className="px-4 py-2">{p.status}</td>
              <td className="px-4 py-2">{p.toggle ? '✅ Enabled' : '❌ Disabled'}</td>
              <td className="px-4 py-2">{p.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}