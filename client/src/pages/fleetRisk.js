import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const FleetRisk = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchHealth = async () => {
      const snapshot = await getDocs(collection(db, 'fleet_health'));
      const data = snapshot.docs.map(doc => {
        const scores = doc.data().monthly_scores || [];
        const recent = scores[scores.length - 1]?.score ?? 0;
        const risk = recent < 50 ? 'High' : recent < 70 ? 'Medium' : 'Low';
        return { id: doc.id, recent, risk };
      });
      setVehicles(data);
    };

    fetchHealth();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">🚨 Fleet Risk Scoring</h2>
      <div className="space-y-2">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <p className="font-bold">Vehicle: {v.id}</p>
            <p className={`font-semibold ${v.risk === 'High' ? 'text-red-600' : v.risk === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
              {v.risk} Risk ({v.recent}/100)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetRisk;