import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, MapPin, Star, User, Clock, Calendar, Globe, Gauge, CheckCircle, XCircle } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [locationStatus, setLocationStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Request geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation(`${latitude},${longitude}`);
          setLocationStatus('success');
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('unsupported');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // Check if the API URL environment variable is set
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      setMessage('API URL is not configured. Please set REACT_APP_API_URL in your environment variables.');
      setMessageType('error');
      return;
    }

    const tripData = {
      origin,
      destination,
      date,
      driver_name: driverName,
      current_location: currentLocation,
      cycle_used: Number(cycleUsed),
      departure_time: departureTime,
    };
    try {
      await axios.post(`${apiUrl}/api/trips/`, tripData);
      setOrigin('');
      setDestination('');
      setDate('');
      setDriverName('');
      setCurrentLocation('');
      setCycleUsed('');
      setDepartureTime('');
      setMessage('Trip submitted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Submission failed:', error.response?.data || error.message);
      setMessage('Failed to submit trip. Please try again.');
      setMessageType('error');
    }
  };

  const LocationIndicator = ({ status }) => {
    const statusClasses = {
      pending: 'bg-gray-400',
      success: 'bg-green-500',
      error: 'bg-red-500',
      unsupported: 'bg-yellow-500',
    };

    const statusText = {
      pending: 'Finding location...',
      success: 'Location found',
      error: 'Location blocked',
      unsupported: 'Geolocation not supported',
    };

    return (
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
        <div className={`w-3 h-3 rounded-full ${statusClasses[status]}`}></div>
        <span>{statusText[status]}</span>
      </div>
    );
  };

  const TabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="max-w-4xl w-full mx-auto bg-white rounded-xl shadow-2xl p-8 md:p-12">
              <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-6">
                Start a New Trip
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Enter the details below to begin your journey.
              </p>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Responsive grid for input fields */}
                <div className="flex flex-col">
                  <label htmlFor="origin" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Origin
                  </label>
                  <input
                    id="origin"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter origin city or address"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="destination" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Destination
                  </label>
                  <input
                    id="destination"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter destination city or address"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="driverName" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} /> Driver Name
                  </label>
                  <input
                    id="driverName"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter driver's name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="cycleUsed" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Gauge size={16} /> Cycle Used (Hrs)
                  </label>
                  <input
                    id="cycleUsed"
                    type="number"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="e.g., 20"
                    value={cycleUsed}
                    onChange={(e) => setCycleUsed(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="departureTime" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} /> Departure Time
                  </label>
                  <input
                    id="departureTime"
                    type="time"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label htmlFor="currentLocation" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe size={16} /> Current Location
                  </label>
                  <input
                    id="currentLocation"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    value={currentLocation}
                    readOnly
                  />
                  <LocationIndicator status={locationStatus} />
                </div>
                <div className="md:col-span-2 flex justify-center mt-6">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                  >
                    Submit Trip
                  </button>
                </div>
              </form>

              {message && (
                <div className={`mt-6 p-4 rounded-lg flex items-center justify-center gap-2 ${
                  messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {messageType === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'dashboard':
        return <div className="p-8 text-center text-2xl font-bold">Dashboard content coming soon!</div>;
      case 'trips':
        return <div className="p-8 text-center text-2xl font-bold">Trips content coming soon!</div>;
      case 'reports':
        return <div className="p-8 text-center text-2xl font-bold">Reports content coming soon!</div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans antialiased">
      <script src="https://cdn.tailwindcss.com"></script>
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo with star and reduced spacing */}
          <Truck className="text-indigo-600" />
          <span className="text-2xl font-bold text-gray-900">FleetTrack</span>
          <Star className="text-yellow-500 w-5 h-5" fill="currentColor" />
        </div>
        <nav>
          <ul className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'home'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('trips')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'trips'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Trips
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Reports
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main className="container mx-auto py-8 px-4">
        <TabContent />
      </main>

      <footer className="w-full text-center py-6 text-gray-500 text-sm">
        <p>
          Need to reach out? Contact us at{' '}
          <a href="mailto:sizwe.ngwenya78@gmail.com" className="text-indigo-600 hover:underline">
            sizwe.ngwenya78@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
