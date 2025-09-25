// cockpit/modules/CockpitDashboard.jsx
import React from 'react';
import ThreatOverlay from './ThreatOverlay';
import GeoIntel from './GeoIntel';
import AccessControl from './AccessControl';
import QRFallback from './QRFallback';

const CockpitDashboard = ({ userId, vehicleId, routeData, role, biometricVerified }) => {
  return (
    <div className="cockpit-dashboard">
      <ThreatOverlay userId={userId} vehicleId={vehicleId} />
      <GeoIntel routeData={routeData} />
      <AccessControl role={role} biometricVerified={biometricVerified} />
      <QRFallback payload={{ userId, vehicleId }} />
    </div>
  );
};

export default CockpitDashboard;