import React, { useEffect, useState } from 'react';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading profile...</p>;
  if (!profile) return <p className="text-center text-red-500">Profile not found.</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">👤 Your Profile</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}