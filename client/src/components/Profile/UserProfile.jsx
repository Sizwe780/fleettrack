import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <p>Please log in.</p>;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Plan: {user.role === 'premium' ? 'FleetTrack Pro' : 'Free'}</p>
    </div>
  );
};

export default UserProfile;