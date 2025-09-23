import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function AuditViewer() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const path = `apps/fleet-track-app/auditLogs`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const entries = snapshot.docs.map(doc => doc.data());
      const sorted = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(sorted);
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = search === '' || (
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor?.toLowerCase().includes(search.toLowerCase()) ||
      log.reason?.toLowerCase().includes(search.toLowerCase())
    );
    const matchesRole = roleFilter === 'all' || log.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const exportLogs = () => {
    const rows = [
      ['Action', 'Actor', 'Role', 'Timestamp', 'Reason'],
      ...filteredLogs.map(log => [
        log.action,
        log.actor,
        log.role ?? '—',
        new Date(log.timestamp).toLocaleString(),
        log.reason ?? ''
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs.csv`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-xl font-bold">🧾 Audit Trail Viewer</h2>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search logs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md w-full md:w-1/2"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="driver">Driver</option>
          <option value="compliance">Compliance</option>
        </select>
        <button onClick={exportLogs} className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Export CSV
        </button>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-sm text-gray-500">No audit logs found.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {filteredLogs.map((log, i) => (
            <li key={i} className="border p-3 rounded-md bg-gray-50">
              <p><strong>Action:</strong> {log.action}</p>
              <p><strong>Actor:</strong> {log.actor}</p>
              <p><strong>Role:</strong> {log.role ?? '—'}</p>
              <p><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</p>
              {log.reason && <p><strong>Reason:</strong> {log.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}