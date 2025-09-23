import React, { useState } from 'react';

const roles = ['admin', 'fleet_manager', 'driver', 'auditor'];
const permissions = ['viewTrips', 'editTrips', 'exportLogs', 'manageUsers'];

const AdvancedRBACEditor = ({ userRoles, onUpdate }) => {
  const [matrix, setMatrix] = useState(() =>
    roles.reduce((acc, role) => {
      acc[role] = permissions.reduce((pAcc, perm) => {
        pAcc[perm] = userRoles?.[role]?.includes(perm) ?? false;
        return pAcc;
      }, {});
      return acc;
    }, {})
  );

  const toggle = (role, perm) => {
    const updated = { ...matrix };
    updated[role][perm] = !updated[role][perm];
    setMatrix(updated);
    onUpdate?.(updated);
  };

  return (
    <div className="mt-6 text-sm">
      <h2 className="text-lg font-bold mb-2">🔐 RBAC Editor</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Role</th>
            {permissions.map((perm) => (
              <th key={perm} className="p-2 text-center">{perm}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role} className="border-t">
              <td className="p-2 font-semibold">{role}</td>
              {permissions.map((perm) => (
                <td key={perm} className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={matrix[role][perm]}
                    onChange={() => toggle(role, perm)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdvancedRBACEditor;