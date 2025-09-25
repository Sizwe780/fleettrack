import React, { useEffect, useState } from 'react';
import { calculateETA } from '../utils/TripETAEngine';

export default function TripProgressTracker({ originCoords, destinationCoords, departureTime }) {
  const [etaData, setEtaData] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateETA = async () => {
      const result = await calculateETA(originCoords, destinationCoords);
      setEtaData(result);
    };

    updateETA();
    const interval = setInterval(updateETA, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [originCoords, destinationCoords]);

  useEffect(() => {
    if (!etaData?.arrivalTime || !departureTime) return;
    const now = new Date();
    const start = new Date(departureTime);
    const end = new Date(etaData.arrivalTime);
    const total = end - start;
    const elapsed = now - start;
    const percent = Math.min(100, Math.round((elapsed / total) * 100));
    setProgress(percent);
  }, [etaData, departureTime]);

  return (
    <div className="mt-4 p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">🚦 Trip Progress</h4>
      {etaData?.arrivalTime ? (
        <>
          <p>Estimated Arrival: <strong>{new Date(etaData.arrivalTime).toLocaleTimeString()}</strong></p>
          <p>Traffic Delay: <strong>{etaData.trafficDelayMinutes} min</strong></p>
          <div className="w-full bg-gray-200 rounded h-3 mt-2">
            <div className="bg-blue-600 h-3 rounded" style={{ width: `${progress}%` }} />
          </div>
        </>
      ) : (
        <p className="text-gray-500">Calculating ETA…</p>
      )}
    </div>
  );
}