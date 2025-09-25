import React, { useEffect, useState } from 'react';

export default function LandingTracker({ telemetry }) {
  const [status, setStatus] = useState('In Transit');

  useEffect(() => {
    if (telemetry.velocity < 100 && telemetry.location.lat < 0.5) {
      setStatus('Landed');
    }
  }, [telemetry]);

  return (
    <div className="mt-4 p-3 bg-green-50 rounded text-sm">
      <h4 className="font-semibold mb-2">🛬 Landing Status</h4>
      <p>Status: <strong>{status}</strong></p>
    </div>
  );
}