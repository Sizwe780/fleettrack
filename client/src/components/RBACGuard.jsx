export default function RBACGuard({ role, allowedRoles, children }) {
    if (!allowedRoles.includes(role)) {
      return <p className="text-red-600">🚫 Access Denied</p>;
    }
    return children;
  }