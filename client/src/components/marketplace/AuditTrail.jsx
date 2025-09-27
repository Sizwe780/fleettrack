import React from 'react';

const AuditTrail = ({ logs }) => (
  <div className="audit-trail">
    <h4>Audit Log</h4>
    <ul>
      {logs.map((log, i) => (
        <li key={i}>{log}</li>
      ))}
    </ul>
  </div>
);

export default AuditTrail;