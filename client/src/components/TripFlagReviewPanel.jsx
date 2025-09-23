import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const TripFlagReviewPanel = () => {
  const [flaggedTrips, setFlaggedTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlaggedTrips = async () => {
      try {
        const snap = await getDocs(collection(db, 'trips'));
        const data = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(trip => trip.status === 'flagged' || trip.status === 'critical');
        setFlaggedTrips(data);
      } catch (err) {
        console.error('Flagged trip fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlaggedTrips();
  }, []);

  const resolveTrip = async (tripId) => {
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
      setFlaggedTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (err) {
      console.error('Trip resolution error:', err);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Flagged Trip Review</h2>
      {isLoading ? (
        <p className="text-gray-500">Loading flagged trips...</p>
      ) : flaggedTrips.length === 0 ? (
        <p className="text-gray-500">No flagged or critical trips found.</p>
      ) : (
        <div className="space-y-4">
          {flaggedTrips.map(trip => (
            <div key={trip.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-1">
                {trip.origin} → {trip.destination}
              </h3>
              <p className="text-sm text-gray-600 mb-1">Driver: {trip.driver_name}</p>
              <p className="text-sm text-gray-600 mb-1">Date: {trip.date}</p>
              <p className="text-sm text-red-700 font-medium mb-2">Status: {trip.status}</p>

              {trip.remarks?.length > 0 && (
                <details className="text-sm text-gray-700 mb-2">
                  <summary className="cursor-pointer font-medium">Trip Remarks</summary>
                  <ul className="list-disc ml-4 mt-1">
                    {trip.remarks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </details>
              )}

              <button
                onClick={() => resolveTrip(trip.id)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Mark as Resolved
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripFlagReviewPanel;