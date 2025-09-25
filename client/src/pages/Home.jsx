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
      <main className="min-h-screen bg-softGrey px-4 py-10">
  <div className="max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold text-darkBlue mb-2">Welcome, ready to log your trip? ✨</h1>
    <p className="text-charcoal mb-6">Fill in the details below to plan your next haul.</p>
    {/* Error message */}
    <form className="bg-white shadow-lg rounded-xl p-6 border border-platinum grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Inputs remain unchanged */}
      <button
        type="submit"
        disabled={loading}
        className={`px-6 py-2 rounded text-white font-semibold ${
          loading ? 'bg-charcoal' : 'bg-darkBlue hover:bg-emerald'
        }`}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
    <footer className="mt-6 text-sm text-charcoal text-right">
      sizwe.ngwenya78@gmail.com
    </footer>
  </div>
</main>    </>
  );
};

export default Home;