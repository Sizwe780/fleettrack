import React, { useState } from 'react';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const TripForm = ({ userId }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [departureTime, setDepartureTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tripData = {
      origin,
      destination,
      date,
      driver_name: driverName,
      current_location: currentLocation,
      cycle_used: Number(cycleUsed),
      departure_time: departureTime,
      ratePerMile: 3.5,
      fuelMpg: 6.5,
      fuelPrice: 3.89,
      otherCosts: 125
    };

    try {
      // Step 1: Get analysis from Django
      const analysisRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/calculate-trip/`, tripData);
      const analysis = analysisRes.data;

      // Step 2: Save full trip to Django
      const fullTrip = {
        ...tripData,
        analysis,
        createdAt: new Date().toISOString()
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/trips/`, fullTrip);

      // ✅ Step 3: Mirror trip to Firestore
      const tripId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await setDoc(doc(db, 'trips', tripId), {
        ...fullTrip,
        status: 'pending',
        driver_uid: userId
      });

      // Step 4: Reset form
      setOrigin('');
      setDestination('');
      setDate('');
      setDriverName('');
      setCurrentLocation('');
      setCycleUsed('');
      setDepartureTime('');

      alert('Trip submitted and synced successfully!');
    } catch (error) {
      console.error('Submission failed:', error.response?.data || error.message);
      alert('Failed to submit trip.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Create New Trip</h2>

      <input
        type="text"
        placeholder="Origin"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
        required
      />

      <input
        type="text"
        placeholder="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
        required
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
        required
      />

      <input
        type="text"
        placeholder="Driver Name"
        value={driverName}
        onChange={(e) => setDriverName(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
        required
      />

      <input
        type="text"
        placeholder="Current Location"
        value={currentLocation}
        onChange={(e) => setCurrentLocation(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      />

      <input
        type="number"
        placeholder="Cycle Used"
        value={cycleUsed}
        onChange={(e) => setCycleUsed(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      />

      <input
        type="time"
        placeholder="Departure Time"
        value={departureTime}
        onChange={(e) => setDepartureTime(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        Submit Trip
      </button>
    </form>
  );
};

export default TripForm;