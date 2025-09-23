import React, { useEffect, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import FAKE_BACKEND_tripAnalysis from '../utils/fakeBackend';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useRBAC } from '../hooks/useRBAC';
import generateTripLogsheet from '../utils/generateTripLogsheet';

const TripPlanner = ({ onTripCreated, appId }) => {
  const TEST_MODE = true;

  const [form, setForm] = useState({
    currentLocation: '',
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
  const { isDriver, loading: roleLoading } = useRBAC();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const locationString = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setForm((prev) => ({ ...prev, currentLocation: locationString }));
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated.');
      if (!TEST_MODE && !isDriver) throw new Error('Access denied: Only drivers can submit trips.');

      const userId = user.uid;
      const newTripData = await FAKE_BACKEND_tripAnalysis(form, userId);

      const logs = generateTripLogsheet(
        newTripData.routeData.estimatedTime,
        newTripData.departureTime
      );

      const hasHOSViolation = logs.some(log =>
        log.blocks?.filter(b => b.type === 'driving')
          .some(b => {
            const start = parseFloat(b.start.split(':')[0]) + parseFloat(b.start.split(':')[1]) / 60;
            const end = parseFloat(b.end.split(':')[0]) + parseFloat(b.end.split(':')[1]) / 60;
            return end - start > 4;
          })
      );

      const flattenedLogs = logs.flatMap(log =>
        log.blocks.map(block => ({
          ...block,
          date: log.date
        }))
      );

      const safeTripData = {
        driver_uid: userId,
        driver_name: newTripData.driver_name,
        origin: newTripData.origin,
        destination: newTripData.destination,
        currentLocation: newTripData.currentLocation,
        cycleUsed: newTripData.cycleUsed,
        date: newTripData.date,
        departureTime: newTripData.departureTime,
        coordinates: newTripData.routeData.path.map(([lng, lat]) => ({ lng, lat })),
        routeData: {
          path: newTripData.routeData.path,
          estimatedTime: newTripData.routeData.estimatedTime,
        },
        analysis: {
          profitability: newTripData.analysis?.profitability ?? null,
          ifta: newTripData.analysis?.ifta ?? null,
          healthScore: newTripData.analysis?.healthScore ?? 100,
          remarks: [
            `Trip is ~${newTripData.distanceMiles} miles long.`,
            `Fleet Health Score: ${newTripData.analysis?.healthScore ?? 100} / 100.`,
            ...(newTripData.analysis?.remarks ? [newTripData.analysis.remarks] : [])
          ],
          dailyLogs: flattenedLogs,
        },
        statusHistory: [
          {
            status: hasHOSViolation ? 'critical' : 'pending',
            timestamp: Date.now(),
            actor: userId,
          }
        ],
        status: hasHOSViolation ? 'critical' : 'pending',
        flagReason: hasHOSViolation ? 'HOS violation: driving block exceeds 4h' : null,
        createdAt: serverTimestamp(),
      };

      console.log('Submitting trip payload:', safeTripData);

      const docRef = await addDoc(
        collection(db, `apps/${appId}/trips`),
        safeTripData
      );

      console.log('Trip successfully submitted with ID:', docRef.id);

      onTripCreated?.({ id: docRef.id, ...safeTripData });
      navigate('/dashboard', { replace: true });

      setForm((prev) => ({
        ...prev,
        cycleUsed: '',
        date: new Date().toISOString().split('T')[0],
        departureTime: '',
      }));
    } catch (err) {
      console.error('Trip submission error:', err);
      setError(err.message || 'Submission failed. Please try again.');
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

  if (roleLoading) return <p>Loading access...</p>;
  if (!TEST_MODE && !isDriver) {
    return <p className="text-red-600">Access denied. Only drivers can submit trips.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Plan a New Trip</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Current Location" name="currentLocation" value={form.currentLocation} />
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