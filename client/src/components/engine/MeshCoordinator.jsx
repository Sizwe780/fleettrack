import React from 'react';

export default function MeshCoordinator({ nodes }) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-navy mb-2">🌐 Mesh Coordination Grid</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        {nodes.map((node, i) => (
          <div key={i} className="bg-blue-50 border border-blue-200 rounded p-3 shadow-sm">
            <p className="font-semibold text-navy">{node.city}</p>
            <p>Status: <span className="font-bold text-green-600">{node.status}</span></p>
            <p>Sync: {node.syncRate}%</p>
          </div>
        ))}
      </div>
    </section>
  );
}