import React from 'react';

export default function RoleGate({ role, allowed, children }) {
  if (!allowed.includes(role)) return null;
  return <>{children}</>;
}