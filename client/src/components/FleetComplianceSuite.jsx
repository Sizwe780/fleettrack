import React from 'react';
import ComplianceScanner from './ComplianceScanner';
import GovernmentExportModule from './GovernmentExportModule';
import TenderTraceabilityEngine from './TenderTraceabilityEngine';


export default function FleetComplianceSuite({ trips, contracts }) {
  return (
    <div className="space-y-10 mt-10">
      <ComplianceScanner trips={trips} />
      <TenderTraceabilityEngine trips={trips} contracts={contracts} />
      <GovernmentExportModule trips={trips} contractId={contracts?.[0]?.id || 'general'} />
    </div>
  );

}