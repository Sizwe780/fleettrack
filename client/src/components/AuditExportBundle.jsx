import React from 'react';
import ExportButton from './ExportButton';

const AuditExportBundle = ({ trip }) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">📦 Audit Export Bundle</h2>
      <ExportButton
        targetId={`audit-bundle-${trip.id}`}
        filename={`FleetTrack_Audit_${trip.id}.pdf`}
      />
      <div id={`audit-bundle-${trip.id}`} className="hidden">
        {/* Include logsheets, compliance summary, signature block */}
      </div>
    </div>
  );
};

export default AuditExportBundle;