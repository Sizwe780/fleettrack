import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function DevOpsConsole({ userId }) {
  const [patches, setPatches] = useState([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    const fetchPatches = async () => {
      const snapshot = await getDocs(collection(db, 'opsCertPatches'));
      const patchList = snapshot.docs.map(doc => ({ ...doc.data(), patchId: doc.id }));
      setPatches(patchList);
    };
    fetchPatches();
  }, []);

  const filteredPatches = patches.filter(patch => {
    const matchesSearch = search === '' || patch.title?.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'all' || patch.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const togglePatch = async (patchId, currentStatus) => {
    const ref = doc(db, 'opsCertPatches', patchId);
    await updateDoc(ref, { enabled: !currentStatus });

    await addDoc(collection(db, 'apps/fleet-track-app/auditLogs'), {
      action: `Toggled patch ${patchId} to ${!currentStatus ? 'enabled' : 'disabled'}`,
      actor: userId,
      role: 'admin',
      timestamp: new Date().toISOString(),
      reason: 'DevOps Console toggle'
    });

    setPatches(prev =>
      prev.map(p => p.patchId === patchId ? { ...p, enabled: !currentStatus } : p)
    );
  };

  const exportRegistry = () => {
    const rows = [
      ['Patch ID', 'Title', 'Module', 'Enabled', 'Severity'],
      ...filteredPatches.map(p => [
        p.patchId,
        p.title,
        p.module,
        p.enabled ? 'true' : 'false',
        p.severity
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opsCert-patch-registry.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold">🛠️ DevOps Console</h2>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search patches"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md w-full md:w-1/2"
        />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="all">All Modules</option>
          <option value="submission">Submission</option>
          <option value="viewer">Viewer</option>
          <option value="audit">Audit</option>
          <option value="compliance">Compliance</option>
          <option value="devops">DevOps</option>
        </select>
        <button onClick={exportRegistry} className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatches.map(patch => (
          <div key={patch.patchId} className="border p-4 rounded-md bg-white shadow-sm space-y-2">
            <h3 className="font-semibold text-lg">{patch.title}</h3>
            <p className="text-sm text-gray-600">Module: {patch.module}</p>
            <p className="text-sm text-gray-600">Severity: {patch.severity}</p>
            <button
              onClick={() => togglePatch(patch.patchId, patch.enabled)}
              className={`px-3 py-1 rounded-md text-white font-semibold ${
                patch.enabled ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {patch.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}