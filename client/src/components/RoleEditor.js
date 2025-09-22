import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const RoleEditor = () => {
  const [users, setUsers] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const updateRole = async (uid, newRole) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role: newRole });
    setUsers(prev =>
      prev.map(u => (u.id === uid ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🛡️ Role Editor</h2>
      {users.map(user => (
        <div key={user.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <select
            value={user.role}
            onChange={(e) => updateRole(user.id, e.target.value)}
            className="p-2 border rounded"
          >
            <option value="admin">Admin</option>
            <option value="driver">Driver</option>
            <option value="analyst">Analyst</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default RoleEditor;