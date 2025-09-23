import React, { useState } from 'react';
import axios from 'axios';

export default function PredictiveRouteViewer() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/predict-route`, {
        origin,
        destination,
        time: new Date().toISOString()
      });
      setPrediction(res.data);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">🧭 Predictive Route Optimizer</h2>

      <input
        type="text"
        placeholder="Origin"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        className="w-full border px-3 py-2 rounded-md"
      />
      <input
        type="text"
        placeholder="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="w-full border px-3 py-2 rounded-md"
      />

      <button
        onClick={handlePredict}
        disabled={loading}
        className={`w-full py-2 rounded-md font-semibold ${
          loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Predicting...' : 'Optimize Route'}
      </button>

      {prediction && (
        <div className="mt-4 text-sm space-y-2">
          <p><strong>ETA:</strong> {prediction.eta}</p>
          <p><strong>Risk Level:</strong> {prediction.risk}</p>
          <p><strong>Optimized Coordinates:</strong></p>
          <ul className="list-disc ml-6">
            {prediction.route.map((coord, i) => (
              <li key={i}>{coord.lat}, {coord.lng}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}