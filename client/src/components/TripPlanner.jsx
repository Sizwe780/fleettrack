import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import FAKE_BACKEND_tripAnalysis from '../utils/fakeBackend';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const TripPlanner = ({ onTripCreated }) => {
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
  const navigate = useNavigate();
  const userId = getAuth().currentUser?.uid;

  const flattenDailyLogs = (logs = []) =>
    logs.map((log) => {
      const flatLog = {};
      for (const key in log) {
        const value = log[key];
        flatLog[key] = Array.isArray(value)
          ? value.map((item) =>
              Array.isArray(item) ? JSON.stringify(item) : item
            )
          : value;
      }
      return flatLog;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!userId) {
        setError('User not authenticated.');
        setIsLoading(false);
        return;
      }

      const newTripData = await FAKE_BACKEND_tripAnalysis(form, userId);

      const safeTripData = {
        origin: newTripData.origin,
        destination: newTripData.destination,
        cycleUsed: newTripData.cycleUsed,
        driver_name: newTripData.driver_name,
        driver_uid: userId,
        date: newTripData.date,
        departureTime: newTripData.departureTime,
        routeData: {
          path: JSON.stringify(newTripData.routeData.path),
          estimatedTime: newTripData.routeData.estimatedTime,
        },
        analysis: {
          profitability: newTripData.analysis?.profitability ?? null,
          ifta: newTripData.analysis?.ifta ?? null,
          remarks: newTripData.analysis?.remarks ?? '',
          dailyLogs: flattenDailyLogs(newTripData.analysis?.dailyLogs),
        },
        status: 'pending',
        healthScore: 100,
      };

      const cleanTripData = JSON.parse(JSON.stringify(safeTripData));
      console.log('Submitting trip:', cleanTripData);
      const docRef = await addDoc(collection(db, 'trips'), cleanTripData);

      onTripCreated?.({ id: docRef.id, ...cleanTripData });

      // ✅ Force dashboard refresh
      navigate('/dashboard', { replace: true });
      window.location.reload();

      setForm({
        origin: '',
        destination: '',
        cycleUsed: '',
        driver_name: '',
        date: '',
        departureTime: '',
      });
    } catch (err) {
      console.error('Trip submission error:', err);
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
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {isLoading ? 'Creating...' : 'Create Trip'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default TripPlanner;