import React, { useEffect, useState } from 'react';

export default function AdminUsersDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });

    const updated = users.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updated);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">🧑‍💼 Admin Users Dashboard</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.role}</td>
              <td className="px-4 py-2">
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.id, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}