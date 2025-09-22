import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import FAKE_BACKEND_tripAnalysis from '../utils/fakeBackend';

const TripPlanner = ({ userId, onTripCreated }) => {
  const [form, setForm] = useState({
    origin: 'Gqeberha, EC',
    destination: 'Cape Town, WC',
    cycleUsed: '25',
    driver_name: 'Sizwe Ngwenya',
    date: new Date().toISOString().split('T')[0],
    departureTime: '08:00',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Deep flatten utility to sanitize nested arrays
  const deepFlatten = (arr) =>
    Array.isArray(arr)
      ? arr.reduce((acc, val) => acc.concat(deepFlatten(val)), [])
      : [arr];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newTripData = await FAKE_BACKEND_tripAnalysis(form, userId);
      const tripsPath = `apps/fleet-track-app/users/${userId}/trips`;

      const sanitizedLogs = Array.isArray(newTripData.analysis?.dailyLogs)
        ? newTripData.analysis.dailyLogs.map((log) => ({
            ...log,
            segments: deepFlatten(log.segments),
            entries: deepFlatten(log.entries),
          }))
        : [];

      const safeTripData = {
        origin: newTripData.origin,
        destination: newTripData.destination,
        cycleUsed: newTripData.cycleUsed,
        driver_name: newTripData.driver_name,
        date: newTripData.date,
        departureTime: newTripData.departureTime,
        routeData: deepFlatten(newTripData.routeData),
        analysis: {
          profitability: deepFlatten(newTripData.analysis?.profitability ?? {}),
          ifta: deepFlatten(newTripData.analysis?.ifta ?? {}),
          remarks: newTripData.analysis?.remarks ?? '',
          dailyLogs: sanitizedLogs,
        },
      };

      // 🔒 Final check for nested arrays
      const hasNestedArray = JSON.stringify(safeTripData).includes('[[');
      if (hasNestedArray) throw new Error('Nested arrays detected. Firestore will reject this payload.');

      const docRef = await addDoc(collection(db, tripsPath), safeTripData);
      onTripCreated({ id: docRef.id, ...safeTripData });

      setForm({
        origin: '',
        destination: '',
        cycleUsed: '',
        driver_name: '',
        date: '',
        departureTime: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const Input = ({ label, name, value, type = 'text' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        value={value}
        type={type}
        onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
        required
        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Plan a New Trip</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Origin" name="origin" value={form.origin} />
          <Input label="Destination" name="destination" value={form.destination} />
          <Input label="Cycle Used (hrs)" name="cycleUsed" value={form.cycleUsed} type="number" />
          <Input label="Driver Name" name="driver_name" value={form.driver_name} />
          <Input label="Trip Date" name="date" value={form.date} type="date" />
          <Input label="Departure Time" name="departureTime" value={form.departureTime} type="time" />
        </div>
        <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          {isLoading ? 'Creating...' : 'Create Trip'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default TripPlanner;