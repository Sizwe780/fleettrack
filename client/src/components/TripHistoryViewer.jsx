import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function TripHistoryViewer({ userId, appId, onTripSelect }) {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      const q = query(
        collection(db, `apps/${appId}/trips`),
        where("driver_uid", "==", userId),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchTrips();
  }, [userId]);

  const handleSelect = trip => {
    onTripSelect(trip);
    navigate("/logsheet");
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">
      <h2 className="text-lg font-bold mb-4">📜 Past Trips</h2>
      <ul className="space-y-3">
        {trips.map(trip => (
          <li
            key={trip.id}
            className="border p-3 rounded cursor-pointer hover:bg-gray-50"
            onClick={() => handleSelect(trip)}
          >
            <div className="font-semibold">{trip.origin} → {trip.destination}</div>
            <div className="text-xs text-gray-500">
              {new Date(trip.timestamp?.seconds * 1000).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}