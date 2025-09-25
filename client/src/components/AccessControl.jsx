// cockpit/modules/AccessControl.jsx
import React from 'react';

const AccessControl = ({ role, biometricVerified }) => {
  if (!biometricVerified) return <div className="access-denied">Biometric verification required</div>;

  return (
    <div className="access-panel">
      <h4>Access Level: {role}</h4>
      {role === 'admin' && <button>View Audit Logs</button>}
    </div>
  );
};

export default AccessControl;