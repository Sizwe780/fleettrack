import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function RoleManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const roles = ['driver', 'analyst', 'admin', 'compliance'];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const entries = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        setUsers(entries);
      } catch (err) {
        console.error('RoleManager fetch error:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });

      await updateDoc(doc(db, `apps/fleet-track-app/auditLogs/${uid}`), {
        action: `Role changed to ${newRole}`,
        actor: 'admin',
        timestamp: new Date().toISOString(),
        reason: 'Manual role update via RBAC Console'
      });

      setUsers(users.map(u => (u.uid === uid ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border mb-6">
      <h2 className="text-xl font-bold mb-4">🔐 Role Manager</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading users...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.uid} className="border-b">
                <td>{user.name ?? 'Unnamed'}</td>
                <td>{user.email ?? '—'}</td>
                <td>{user.role}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                    className="p-1 border rounded text-xs"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}