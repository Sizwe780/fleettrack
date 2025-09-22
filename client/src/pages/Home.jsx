import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from './Navbar';

const Home = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    driverName: '',
    pickupLocation: '',
    dropoffLocation: '',
    cycleHours: '',
    departure: ''
  });

  const [currentLocation, setCurrentLocation] = useState('');
  const [locationDetected, setLocationDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
        setCurrentLocation(location);
        setLocationDetected(true);
      },
      (err) => {
        console.warn('Location error:', err);
        setLocationDetected(false);
        setError('Unable to detect location. Please enter manually.');
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      currentLocation: currentLocation || 'Manual entry required'
    };

    try {
      await API.post('/trips', payload);
      navigate('/dashboard');
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Trip submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, ready to log your trip? ✨</h1>
          <p className="text-gray-500 mb-6">Fill in the details below to plan your next haul.</p>

          {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Departure Date & Time</label>
                <input
                  type="datetime-local"
                  name="departure"
                  value={formData.departure}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Origin</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cycle Used (hrs)</label>
                <input
                  type="number"
                  name="cycleHours"
                  value={formData.cycleHours}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <input
                  type="text"
                  name="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm font-medium text-gray-700">Location</span>
                <span
                  className={`w-3 h-3 rounded-full ${
                    locationDetected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="col-span-1 md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded text-white font-semibold ${
                  loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>

          <footer className="mt-6 text-sm text-gray-600 text-right">
            sizwe.ngwenya7@gmail.com
          </footer>
        </div>
      </main>
    </>
  );
};

export default Home;