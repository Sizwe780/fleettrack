import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import validateTripPayload from '../utils/tripValidator'; // ✅ OpsCert Patch 01

const TripForm = ({ userId, onTripCreated }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation(`${latitude},${longitude}`);
      },
      (err) => console.error('Geolocation error:', err)
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

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

      // Step 2: Build enriched trip payload
      const fullTrip = {
        ...tripData,
        analysis,
        createdAt: new Date().toISOString()
      };

      const enrichedTrip = {
        ...fullTrip,
        status: 'pending',
        driver_uid: userId,
        remarks: analysis.remarks ?? ['Driver reported minor delay due to traffic'],
        healthScore: analysis.healthScore ?? 87,
        statusHistory: analysis.statusHistory ?? [
          { status: 'scheduled', timestamp: new Date().toISOString() },
          { status: 'departed', timestamp: new Date().toISOString() }
        ],
        vehicleStats: analysis.vehicleStats ?? {
          engineTemp: 92,
          tirePressure: 34,
          oilLevel: 'normal',
          batteryHealth: 'good'
        },
        driverStats: analysis.driverStats ?? {
          totalTrips: 12,
          violationCount: 0,
          avgHealthScore: 88,
          avgProfit: 4500
        },
        coordinates: analysis.routeData?.geometry?.coordinates ?? [
          [25.61, -33.96],
          [25.62, -33.97],
          [25.63, -33.98]
        ]
      };

      // ✅ Step 3: Validate payload before Firestore write
      const { isValid, errors } = validateTripPayload(enrichedTrip);
      if (!isValid) {
        console.error('Trip validation failed:', errors);
        setStatusMessage(`❌ Trip rejected: ${errors.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Step 4: Save to Django backend
      await axios.post(`${process.env.REACT_APP_API_URL}/api/trips/`, fullTrip);

      // Step 5: Save to Firestore
      const path = `apps/fleet-track-app/users/${userId}/trips`;
      await addDoc(collection(db, path), enrichedTrip);

      if (onTripCreated) onTripCreated(enrichedTrip);

      // Step 6: Reset form
      setOrigin('');
      setDestination('');
      setDate('');
      setDriverName('');
      setCurrentLocation('');
      setCycleUsed('');
      setDepartureTime('');
      setStatusMessage('✅ Trip submitted and synced successfully!');
    } catch (error) {
      console.error('Submission failed:', error.response?.data || error.message);
      setStatusMessage('❌ Failed to submit trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-xl shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">📍 Create New Trip</h2>

      {statusMessage && (
        <div className={`text-sm font-medium mb-2 ${statusMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {statusMessage}
        </div>
      )}

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
        readOnly
      />

      <input
        type="number"
        placeholder="Cycle Used (hrs)"
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
        disabled={isSubmitting}
        className={`w-full py-2 rounded-md font-semibold ${
          isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Trip'}
      </button>
    </form>
  );
};

export default TripForm;