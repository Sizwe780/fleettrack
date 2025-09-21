import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    driverName: 'Sizwe',
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    cycleHours: '',
    departure: ''
  });

  // Auto-detect current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          currentLocation: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }));
      },
      (err) => console.warn('Location error:', err),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/trips', formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Trip submission failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-6">Welcome, ready to log your trip? ✨</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl grid grid-cols-2 gap-6"
      >
        {/* Left Column */}
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium">Driver Name</label>
            <input
              type="text"
              name="driverName"
              value={formData.driverName}
              readOnly
              className="w-full border p-2 rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Pickup Location</label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Dropoff Location</label>
            <input
              type="text"
              name="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-4">
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
          <div className="flex items-center space-x-2 mt-2">
            <span className="block text-sm font-medium">Location</span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-6 text-sm text-gray-600">
        sizwe.ngwenya7@gmail.com
      </div>
    </div>
  );
};

export default Home;