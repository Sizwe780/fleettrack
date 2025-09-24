import React, { useEffect, useState } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const roles = ['driver', 'fleet_manager', 'admin'];
const permissions = ['viewTrips', 'submitTrips', 'flagTrips', 'exportTrips', 'editRoles'];

export default function AdvancedRBACEditor() {
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrix = async () => {
      const snapshot = await getDocs(collection(db, 'apps/fleet-track-app/rbac'));
      const data = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setMatrix(data);
      setLoading(false);
    };
    fetchMatrix();
  }, []);

  const togglePermission = (role, perm) => {
    const updated = { ...matrix };
    updated[role] = updated[role] || {};
    updated[role][perm] = !updated[role][perm];
    setMatrix(updated);
  };

  const saveMatrix = async () => {
    setLoading(true);
    for (const role of roles) {
      await setDoc(doc(db, 'apps/fleet-track-app/rbac', role), matrix[role] || {});
    }
    alert('RBAC matrix saved.');
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow text-sm">
      <h2 className="text-xl font-bold mb-4">🔐 Advanced RBAC Editor</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Role</th>
              {permissions.map(perm => (
                <th key={perm} className="p-2 text-left">{perm}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role}>
                <td className="p-2 font-semibold">{role}</td>
                {permissions.map(perm => (
                  <td key={perm} className="p-2">
                    <input
                      type="checkbox"
                      checked={matrix[role]?.[perm] || false}
                      onChange={() => togglePermission(role, perm)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={saveMatrix}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save RBAC Matrix
      </button>
    </div>
  );
}