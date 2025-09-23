import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// This is the component for displaying fleet health data.
const FleetHealth = () => {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define SVG icons directly within the component
  const FireText = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
  const FireCheck = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
  const FireAlert = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
  const FireWarning = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 10c-.83 4.7-6.5 9-6.5 9s1.5-6.5 5.5-12z"/><path d="M21 8c-3 1-4.5 3.5-5.5 8"/><path d="M3 8c3 1 4.5 3.5 5.5 8"/><path d="M12 2v3"/><path d="M12 19v3"/></svg>;

  // Initialize Firebase and Firestore instances
  const db = getFirestore();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    const healthCollectionPath = `/artifacts/${__app_id}/users/${userId}/fleetHealth`;
    const q = query(collection(db, healthCollectionPath), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setHealthData(data);
      setLoading(false);
    }, (err) => {
      console.error("Firebase fetch error:", err);
      setError("Failed to load data. Please check your permissions.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, db]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Good':
        return <FireCheck className="text-green-500" />;
      case 'Warning':
        return <FireWarning className="text-yellow-500" />;
      case 'Critical':
        return <FireAlert className="text-red-500" />;
      default:
        return <FireText className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Loading fleet health data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Fleet Health Dashboard</h1>
        {healthData.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">
            No fleet health data available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthData.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mr-4 text-2xl">
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{item.vehicleId}</h2>
                      <p className="text-sm text-gray-500">Status: <span className={`font-semibold ${
                        item.status === 'Good' ? 'text-green-600' :
                        item.status === 'Warning' ? 'text-yellow-600' :
                        item.status === 'Critical' ? 'text-red-600' : ''
                      }`}>{item.status}</span></p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong className="font-medium">Odometer:</strong> {item.odometer} miles</p>
                    <p><strong className="font-medium">Last Service:</strong> {new Date(item.lastService).toLocaleDateString()}</p>
                    <p><strong className="font-medium">Next Service:</strong> {new Date(item.nextService).toLocaleDateString()}</p>
                    <p><strong className="font-medium">Details:</strong> {item.details}</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-400 text-right">
                  Last updated: {new Date(item.timestamp?.toDate()).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FleetHealth;
