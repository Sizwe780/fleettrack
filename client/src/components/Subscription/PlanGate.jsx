import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const PlanGate = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user?.role !== 'premium') {
    return <p>This feature is available on FleetTrack Pro. Upgrade to unlock.</p>;
  }

  return children;
};

export default PlanGate;