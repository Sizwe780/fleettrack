import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const TripAssignPanel = () => {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isLoading, setIsLoading] = useState(true);
  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripSnap = await getDocs(collection(db, 'trips'));
        const driverSnap = await getDocs(collection(db, 'users'));
        const vehicleSnap = await getDocs(collection(db, 'vehicles'));

        setTrips(tripSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setDrivers(driverSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === 'driver'));
        setVehicles(vehicleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Assignment fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedTripId || !selectedDriverId || !selectedVehicleId) return;

    try {
      await updateDoc(doc(db, 'trips', selectedTripId), {
        assignedTo: selectedDriverId,
        vehicle_id: selectedVehicleId,
        priority,
        status: 'assigned',
        assignedBy: userId,
        assignedAt: new Date().toISOString(),
      });
      alert('Trip assigned successfully!');
      setSelectedTripId('');
      setSelectedDriverId('');
      setSelectedVehicleId('');
      setPriority('normal');
    } catch (err) {
      console.error('Trip assignment failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-md border">
      <h1 className="text-2xl font-bold mb-4">Assign Trip</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Trip</label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="">-- Choose Trip --</option>
              {trips.map(trip => (
                <option key={trip.id} value={trip.id}>
                  {trip.origin} → {trip.destination} ({trip.date})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assign Driver</label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="">-- Choose Driver --</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name || driver.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="">-- Choose Vehicle --</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} ({vehicle.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              onClick={handleAssign}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Assign Trip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripAssignPanel;