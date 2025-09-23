import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import TripReplayWithStops from './TripReplayWithStops';
import TripLogsheet from './TripLogsheet';
import TripViewerExportButtons from './TripViewerExportButtons';
import TripViewerAuditTrail from './TripViewerAuditTrail';

export default function TripViewer() {
  const { tripId } = useParams();
  const location = useLocation();
  const [trip, setTrip] = useState(location.state?.trip || null);
  const [auditTrail, setAuditTrail] = useState([]);

  useEffect(() => {
    const fetchTrip = async () => {
      const userId = location.state?.trip?.driver_uid;
      if (!trip && userId) {
        const path = `apps/fleet-track-app/users/${userId}/trips/${tripId}`;
        const docSnap = await getDoc(doc(db, path));
        if (docSnap.exists()) {
          const tripData = docSnap.data();
          setTrip(tripData);
          fetchAuditTrail(tripData.driver_uid);
        }
      }
    };

    const fetchAuditTrail = async (uid) => {
      const auditPath = `apps/fleet-track-app/users/${uid}/trips/${tripId}/auditTrail`;
      const snapshot = await getDocs(collection(db, auditPath));
      const logs = snapshot.docs.map(doc => doc.data());
      setAuditTrail(logs);
    };

    fetchTrip();
  }, [tripId, trip, location.state]);

  if (!trip) return <p className="text-center mt-10 text-gray-500">Loading trip data...</p>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">🚚 Trip Viewer</h2>
      <TripReplayWithStops coordinates={trip.coordinates} stops={trip.stops} />
      <TripLogsheet trip={trip} />
      <TripViewerAuditTrail logs={auditTrail} />
      <TripViewerExportButtons trip={trip} tripId={tripId} />
    </div>
  );
}