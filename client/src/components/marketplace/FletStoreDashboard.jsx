import React, { useState, useEffect } from 'react';
import FleetStore from './FleetStore';
import CreditDisplay from './CreditDisplay';
import AuditTrail from './AuditTrail';
import { getStudentTelemetry } from '../../api/StudentTelemetry';

const FleetStoreDashboard = ({ studentId }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [credits, setCredits] = useState(100);

  useEffect(() => {
    getStudentTelemetry(studentId).then(data => setTelemetry(data));
  }, [studentId]);

  return (
    <div className="fleetstore-dashboard">
      <CreditDisplay credits={credits} badges={telemetry?.earnedBadges || []} />
      <FleetStore studentId={studentId} />
      <AuditTrail logs={auditLogs} />
    </div>
  );
};

export default FleetStoreDashboard;