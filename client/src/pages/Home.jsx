import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from './Navbar';

const Home = () => {
  const navigate = useNavigate();

  // Form fields (excluding location)
  const [formData, setFormData] = useState({
    driverName: '',
    pickupLocation: '',
    dropoffLocation: '',
    cycleHours: '',
    departure: ''
  });

  // Location state
  const [currentLocation, setCurrentLocation] = useState('');
  const [locationDetected, setLocationDetected] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect location once on mount
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

  // Handle input changes
  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
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
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-6">Welcome, ready to log your trip? ✨</h1>

        {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl grid grid-cols-2 gap-6 relative z-10"
        >
          {/* Left Column */}
          <div className="flex flex-col space-y-4">
            <label className="block text-sm font-medium">
              Driver Name
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Departure Date & Time
              <input
                type="datetime-local"
                name="departure"
                value={formData.departure}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Origin
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </label>
          </div>

          {/* Right Column */}
          <div className="flex flex-col space-y-4">
            <label className="block text-sm font-medium">
              Cycle Used (hrs)
              <input
                type="number"
                name="cycleHours"
                value={formData.cycleHours}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Destination
              <input
                type="text"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </label>

            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm font-medium">Location</span>
              <span className={`w-3 h-3 rounded-full ${locationDetected ? 'bg-green-500' : 'bg-red-500'}`} />
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

        <footer className="mt-6 text-sm text-gray-600">
          sizwe.ngwenya7@gmail.com
        </footer>
      </main>
    </>
  );
};

export default Home;