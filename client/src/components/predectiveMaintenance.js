import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const PredictiveMaintenance = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      const snapshot = await getDocs(collection(db, 'fleet_health'));
      const data = snapshot.docs.map(doc => {
        const scores = doc.data().monthly_scores || [];
        const last3 = scores.slice(-3).map(s => s.score);
        const avg = last3.reduce((sum, s) => sum + s, 0) / (last3.length || 1);
        const risk = avg < 50 ? 'High' : avg < 70 ? 'Medium' : 'Low';
        return { id: doc.id, avg: Math.round(avg), risk };
      });
      setVehicles(data);
    };

    fetchScores();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">🛠️ Predictive Maintenance</h2>
      <div className="space-y-2">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <p className="font-bold">Vehicle: {v.id}</p>
            <p className={`font-semibold ${v.risk === 'High' ? 'text-red-600' : v.risk === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
              {v.risk} Risk ({v.avg}/100)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictiveMaintenance;