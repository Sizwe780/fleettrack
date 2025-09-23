import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const FleetHealthDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const snap = await getDocs(collection(db, 'vehicles'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicles(data);
      } catch (err) {
        console.error('Fleet fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const getHealthColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Fleet Health Overview</h2>
      {isLoading ? (
        <p className="text-gray-500">Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-1">{vehicle.model} ({vehicle.plate})</h3>
              <p className="text-sm text-gray-600 mb-1">Last Service: {vehicle.lastServiceDate}</p>
              <p className="text-sm text-gray-600 mb-1">Mileage: {vehicle.mileage} km</p>
              <p className="text-sm text-gray-600 mb-1">Trips: {vehicle.totalTrips}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded ${getHealthColor(vehicle.healthScore)}`}>
                Health Score: {vehicle.healthScore}/100
              </span>
              {vehicle.flaggedIssues?.length > 0 && (
                <details className="mt-2 text-sm text-red-700">
                  <summary className="cursor-pointer font-medium">Flagged Issues</summary>
                  <ul className="list-disc ml-4 mt-1">
                    {vehicle.flaggedIssues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetHealthDashboard;