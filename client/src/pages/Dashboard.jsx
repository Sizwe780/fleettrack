import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/NavBar';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await API.get('/trips');
        setTrips(res.data);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const getStatus = (departure, cycleHours) => {
    const depTime = new Date(departure);
    const now = new Date();
    const hoursElapsed = (now - depTime) / (1000 * 60 * 60);
    if (hoursElapsed < cycleHours) return 'active';
    if (hoursElapsed < cycleHours + 2) return 'pending';
    return 'overdue';
  };

  const statusColor = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    overdue: 'bg-red-500'
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Trip Dashboard 📊</h1>

        {loading ? (
          <p className="text-gray-600">Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-gray-600">No trips logged yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const status = getStatus(trip.departure, trip.cycleHours);
              return (
                <div
                  key={trip._id}
                  className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">{trip.driverName}</h2>
                    <span
                      className={`w-3 h-3 rounded-full ${statusColor[status]}`}
                      title={status}
                    ></span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Current Location:</strong> {trip.currentLocation}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Pickup:</strong> {trip.pickupLocation}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Dropoff:</strong> {trip.dropoffLocation}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Departure:</strong>{' '}
                    {new Date(trip.departure).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Cycle Used:</strong> {trip.cycleHours} hrs
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Status:</strong>{' '}
                    <span className="capitalize">{status}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;