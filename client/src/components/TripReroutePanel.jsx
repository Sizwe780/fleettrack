import React, { useEffect, useState } from 'react';
import { suggestAlternateRoutes } from '../utils/TripRerouteEngine';

export default function TripReroutePanel({ originCoords, destinationCoords }) {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const loadRoutes = async () => {
      const data = await suggestAlternateRoutes(originCoords, destinationCoords);
      setRoutes(data);
    };
    loadRoutes();
  }, [originCoords, destinationCoords]);

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded text-sm">
      <h4 className="font-semibold mb-2">🔄 Alternate Routes</h4>
      {routes.map((r, i) => (
        <div key={i} className="mb-2">
          <p>ETA: <strong>{new Date(r.eta).toLocaleTimeString()}</strong></p>
          <p>Traffic Delay: {Math.round(r.delay / 60)} min</p>
        </div>
      ))}
    </div>
  );
}