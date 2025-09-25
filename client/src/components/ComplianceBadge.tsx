// expansion/ComplianceBadge.tsx
import React from 'react';

const ComplianceBadge = ({ status }) => {
  const color = status === 'compliant' ? 'green' : status === 'warning' ? 'orange' : 'red';
  return <span className={`badge badge-${color}`}>{status.toUpperCase()}</span>;
};

export default ComplianceBadge;