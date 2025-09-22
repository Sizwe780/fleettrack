import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(prev =>
        prev.map(u => (u.id === uid ? { ...u, role: newRole } : u))
      );
      console.log(`✅ Role updated for ${uid}`);
    } catch (err) {
      console.error('❌ Role update failed:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      <table className="w-full border rounded-md overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">FCM Token</th>
            <th className="p-2 text-left">Last Login</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.name ?? '—'}</td>
              <td className="p-2">{user.email ?? '—'}</td>
              <td className="p-2 capitalize">{user.role}</td>
              <td className="p-2 text-xs break-all">{user.fcmToken?.slice(0, 24) ?? '—'}...</td>
              <td className="p-2 text-sm text-gray-600">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
              </td>
              <td className="p-2">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                  <option value="analyst">Analyst</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;