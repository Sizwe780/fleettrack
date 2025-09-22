import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const PredictiveMaintenance = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'fleet_health'));
        const data = snapshot.docs.map(doc => {
          const scores = doc.data().monthly_scores || [];
          const last3 = scores.slice(-3).map(s => s.score);
          const avg = last3.reduce((sum, s) => sum + s, 0) / (last3.length || 1);
          const risk = avg < 50 ? 'High' : avg < 70 ? 'Medium' : 'Low';
          const recommendation =
            risk === 'High' ? 'Immediate inspection recommended' :
            risk === 'Medium' ? 'Monitor closely next cycle' :
            'No action needed';

          return {
            id: doc.id,
            avg: Math.round(avg),
            risk,
            recommendation
          };
        });

        setVehicles(data);
      } catch (err) {
        console.error('Error fetching fleet health:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const getRiskColor = (risk) => {
    if (risk === 'High') return 'text-red-600';
    if (risk === 'Medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">🛠️ Predictive Maintenance</h2>

      {loading ? (
        <p className="text-gray-500">Loading fleet health data...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-gray-500">No fleet health records found.</p>
      ) : (
        <div className="space-y-2">
          {vehicles.map(v => (
            <div
              key={v.id}
              className="bg-white p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div>
                <p className="font-bold">Vehicle: {v.id}</p>
                <p className={`font-semibold ${getRiskColor(v.risk)}`}>
                  {v.risk} Risk ({v.avg}/100)
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-2 md:mt-0">
                {v.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictiveMaintenance;