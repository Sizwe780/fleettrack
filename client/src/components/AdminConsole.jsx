import { updateRole } from "../firebase";

export default function RoleSwitcher({ user }) {
  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        🔐 Change Role
      </label>
      <select
        onChange={(e) => updateRole(user.uid, e.target.value)}
        defaultValue={user.role}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
      >
        <option value="driver">Driver</option>
        <option value="admin">Admin</option>
        <option value="compliance">Compliance</option>
      </select>

      <div className="mt-3 text-xs text-gray-600">
        Current role: <span className="font-semibold text-green-700">{user.role}</span>
      </div>
    </div>
  );
}