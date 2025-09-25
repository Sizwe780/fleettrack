// cockpit/modules/DriverCockpit.jsx
import React, { useEffect, useState } from 'react';

const DriverCockpit = ({ driverId }) => {
  const [profile, setProfile] = useState({});
  const [fatigue, setFatigue] = useState({});
  const [compliance, setCompliance] = useState({});
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetch(`/api/driver-profile?id=${driverId}`).then(res => res.json()).then(setProfile);
    fetch(`/api/driver-fatigue?id=${driverId}`).then(res => res.json()).then(setFatigue);
    fetch(`/api/driver-compliance?id=${driverId}`).then(res => res.json()).then(setCompliance);
    fetch(`/api/driver-routes?id=${driverId}`).then(res => res.json()).then(setRoutes);
  }, [driverId]);

  return (
    <div className="driver-cockpit">
      <h3>{profile.name} | {profile.license}</h3>
      <div>Fatigue Index: {fatigue.index}</div>
      <div>Compliance: {compliance.status}</div>
      <ul>
        {routes.map(r => <li key={r.id}>{r.origin} → {r.destination}</li>)}
      </ul>
    </div>
  );
};

export default DriverCockpit;