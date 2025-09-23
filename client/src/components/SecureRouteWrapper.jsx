import { useUser } from '../hooks/useUser';

export default function SecureRouteWrapper({ allowedRoles, children }) {
  const { role } = useUser();
  return allowedRoles.includes(role) ? children : <p>🔒 Restricted</p>;
}