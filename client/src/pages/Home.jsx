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
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = { ...formData, currentLocation };
    try {
      await API.post('/trips', payload);
      navigate('/dashboard');
    } catch (err) {
      console.error('Trip submission failed:', err);
      setError('Trip submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-6">Welcome, ready to log your trip? ✨</h1>

        {error && (
          <div className="mb-4 text-red-600 font-medium">{error}</div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl grid grid-cols-2 gap-6 relative z-50"
        >
          {/* Left Column */}
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium">Driver Name</label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Departure Date & Time</label>
              <input
                type="datetime-local"
                name="departure"
                value={formData.departure}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Origin</label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium">Cycle Used (hrs)</label>
              <input
                type="number"
                name="cycleHours"
                value={formData.cycleHours}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Destination</label>
              <input
                type="text"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="block text-sm font-medium">Location</span>
              <span className={`w-3 h-3 rounded-full ${locationDetected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-sm text-gray-600">
          sizwe.ngwenya7@gmail.com
        </div>
      </div>
    </>
  );
};

export default Home;