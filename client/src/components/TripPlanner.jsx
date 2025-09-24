import React, { useState, useEffect } from 'react';
import {
  doc, setDoc, addDoc, getDoc, collection,
  query, where, orderBy, limit, onSnapshot,
  getDocs, GeoPoint
} from 'firebase/firestore';
import { db } from '../firebase';
import FAKE_BACKEND_tripAnalysis from '../utils/fakeBackend';
import evaluateTripRisk from '../utils/tripFlagger';

export default function TripPlanner({ userId }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [driverName, setDriverName] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [odometerStart, setOdometerStart] = useState('');
  const [contractId, setContractId] = useState('');
  const [predictiveAlerts, setPredictiveAlerts] = useState([]);
  const [suggestedDriver, setSuggestedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [originCoords, setOriginCoords] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async position => {
        setLocationDetected(true);
        const { latitude, longitude } = position.coords;
        setOriginCoords(new GeoPoint(latitude, longitude));

        try {
          const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
          );
          const data = await res.json();
          const place = data.results[0]?.formatted;
          if (place) setOrigin(place);
        } catch (err) {
          console.error('Geocoding error:', err);
        }
      },
      () => setLocationDetected(false)
    );
  }, []);

  useEffect(() => {
    if (!userId) return;

    const recentTripQuery = query(
      collection(db, 'apps/fleet-track-app/trips'),
      where('driver_uid', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(recentTripQuery, snapshot => {
      const lastTrip = snapshot.docs[0]?.data();
      if (lastTrip?.destination) setDestination(lastTrip.destination);
    });

    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    const fetchVehicles = async () => {
      const snapshot = await getDocs(collection(db, 'apps/fleet-track-app/vehicles'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(list);
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      const snapshot = await getDocs(collection(db, 'apps/fleet-track-app/contracts'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContracts(list);
    };
    fetchContracts();
  }, []);

  const sanitize = obj =>
    Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (Array.isArray(value)) {
          if (Array.isArray(value[0])) {
            return [key, value.map(item => {
              if (Array.isArray(item)) {
                const [lat, lng] = item;
                return { lat, lng };
              }
              return item;
            })];
          }
          return [key, value];
        }
        return [key, value];
      }).filter(([_, v]) => v !== undefined)
    );

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      origin,
      destination,
      driver_name: driverName,
      departureTime,
      cycleUsed,
      vehicle_id: vehicleId,
      odometer_start: Number(odometerStart),
      driver_uid: userId,
      createdAt: new Date().toISOString(),
      origin_location: originCoords || null,
      contract_id: contractId || null,
    };

    try {
      const analysisRaw = await FAKE_BACKEND_tripAnalysis(payload, userId);
      const analysis = sanitize(analysisRaw);

      const tripData = {
        ...payload,
        analysis,
        arrivalTime: analysisRaw.arrivalTime,
        status: 'pending',
        statusHistory: [{ status: 'pending', timestamp: new Date().toISOString() }],
      };

      const docRef = await addDoc(collection(db, 'apps/fleet-track-app/trips'), tripData);

      if (analysisRaw.suggestedRoute) {
        const segmentsRef = collection(db, `apps/fleet-track-app/trips/${docRef.id}/routeSegments`);
        analysisRaw.suggestedRoute.forEach(([lat, lng], i) => {
          const segment = {
            lat,
            lng,
            fatigueRisk: analysisRaw.fatigueTrace?.[i] ?? null,
            fuelRisk: analysisRaw.fuelTrace?.[i] ?? null,
            delayRisk: analysisRaw.delayTrace?.[i] ?? null,
          };
          addDoc(segmentsRef, segment);
        });
      }

      if (contractId) {
        const contractRef = doc(db, 'apps/fleet-track-app/contracts', contractId);
        const contractSnap = await getDoc(contractRef);
        const slaHours = contractSnap.exists() ? contractSnap.data().slaHours : null;

        if (slaHours && departureTime && analysisRaw.arrivalTime) {
          const start = new Date(departureTime);
          const end = new Date(analysisRaw.arrivalTime);
          const durationHours = (end - start) / 36e5;

          if (durationHours > slaHours) {
            await setDoc(doc(db, `apps/fleet-track-app/trips/${docRef.id}`), {
              slaBreached: true,
              slaDuration: durationHours.toFixed(2),
              slaLimit: slaHours,
            }, { merge: true });

            await addDoc(collection(db, `apps/fleet-track-app/trips/${docRef.id}/auditTrail`), {
              action: 'SLA breach detected',
              actor: userId,
              timestamp: new Date().toISOString(),
              reason: `Trip duration ${durationHours.toFixed(2)}h exceeded SLA limit of ${slaHours}h`,
            });
          }
        }
      }

      const alerts = [];
      if (analysisRaw.fuelRisk > 0.8) alerts.push('⚠️ High fuel risk');
      if (analysisRaw.delayRisk > 0.7) alerts.push('⏱️ Delay likely');
      if (analysisRaw.fatigueRisk > 0.6) alerts.push('😴 Driver fatigue risk');
      setPredictiveAlerts(alerts);

      if (alerts.length > 0) {
        await fetch('/sendPush', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Trip Risk Alert',
            body: alerts.join('\n'),
            token: analysisRaw.driverFCMToken || ''
          })
        });
      }

      if (analysisRaw.suggestedDriver_name) {
        setSuggestedDriver(analysisRaw.suggestedDriver_name);
      }

      const { shouldFlag, reasons } = evaluateTripRisk(tripData);
      if (shouldFlag) {
        await setDoc(doc(db, `apps/fleet-track-app/trips/${docRef.id}`), {
          status: 'critical',
          flaggedAt: new Date().toISOString(),
          flagReason: reasons.join(', '),
        }, { merge: true });

        await addDoc(collection(db, `apps/fleet-track-app/trips/${docRef.id}/auditTrail`), {
          action: 'Trip auto-flagged as critical',
          actor: userId,
          timestamp: new Date().toISOString(),
          reason: reasons.join(', '),
        });
      }

      setLoading(false);
      alert('Trip submitted successfully!');
    } catch (err) {
      console.error('TripPlanner error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-10 bg-white rounded-xl shadow-xl transform translate-y-2">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">📝 Plan New Trip</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
        <input type="text" placeholder="Driver Name" value={driverName} onChange={e => setDriverName(e.target.value)} className="p-2 border rounded w-full" />
        <input type="text" placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} className="p-2 border rounded w-full"/>
        <input type="text" placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} className="p-2 border rounded w-full" />
        <input type="datetime-local" value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="p-2 border rounded w-full" />
        <input type="text" placeholder="Cycle Used" value={cycleUsed} onChange={e => setCycleUsed(e.target.value)} className="p-2 border rounded w-full" />

        <select value={contractId} onChange={e => setContractId(e.target.value)} className="p-2 border rounded w-full bg-white">
          <option value="">Select Contract</option>
          {contracts.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} — SLA: {c.slaHours}h
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-2">
          <select
            value={vehicleId}
            onChange={e => {
              const selected = vehicles.find(v => v.id === e.target.value);
              setVehicleId(e.target.value);
              if (selected?.cycleUsed) setCycleUsed(selected.cycleUsed);
              if (selected?.odometerStart) setOdometerStart(selected.odometerStart);
            }}
            className="p-2 border rounded w-full bg-white"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.healthScore ?? 'N/A'}%
              </option>
            ))}
          </select>

          {origin && (
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full border ${
                  locationDetected ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'
                }`}
                title={locationDetected ? 'Location detected' : 'Location unavailable'}
              />
              <span className="text-xs text-gray-600">
                {locationDetected ? `Location: ${origin}` : 'Location unavailable'}
              </span>
            </div>
          )}
        </div>

        <input
          type="number"
          placeholder="Odometer Start"
          value={odometerStart}
          onChange={e => setOdometerStart(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Submitting...' : 'Submit Trip'}
        </button>
      </div>

      {predictiveAlerts.length > 0 && (
        <div className="mt-6 text-sm text-red-600 space-y-1">
          {predictiveAlerts.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}

      {suggestedDriver && (
        <p className="mt-4 text-sm text-blue-600">
          🧠 Suggested Driver: <strong>{suggestedDriver}</strong>
        </p>
      )}

      {/* 🗺️ Origin Map Preview */}
      {originCoords && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Origin Location</h3>
          <iframe
            title="Origin Map"
            width="100%"
            height="300"
            className="rounded-lg overflow-hidden"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${originCoords.latitude},${originCoords.longitude}&z=14&output=embed`}
          />
        </div>
      )}

      {/* 🗺️ Route Preview */}
      {origin && destination && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Route Preview</h3>
          <iframe
            title="Route Map"
            width="100%"
            height="300"
            className="rounded-lg overflow-hidden"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`}
          />
        </div>
      )}
    </div>
  );
}
        