import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DepartureOptimizer = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = async () => {
    if (!origin || !destination) return;

    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'trips'));
      const trips = snap.docs.map(doc => doc.data());

      const matchingTrips = trips.filter(
        t => t.origin === origin && t.destination === destination
      );

      const hourCounts = {};
      matchingTrips.forEach(t => {
        const hour = parseInt(t.departureTime?.split(':')[0]);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      setSuggestion(bestHour ? `${bestHour}:00` : 'No data available');
    } catch (err) {
      console.error('Optimizer error:', err);
      setSuggestion('Error generating suggestion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Departure Time Optimizer</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Origin (e.g. Gqeberha, EC)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="text"
          placeholder="Destination (e.g. Cape Town, WC)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <button
          onClick={handleOptimize}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          {isLoading ? 'Analyzing...' : 'Suggest Best Time'}
        </button>
        {suggestion && (
          <p className="mt-2 text-sm text-gray-700">
            Suggested Departure Time: <span className="font-semibold">{suggestion}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default DepartureOptimizer;