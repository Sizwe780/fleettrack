import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import TripSummaryCard from './TripSummaryCard';
import ComplianceExportPanel from './ComplianceExportPanel';

export default function ComplianceArchiveDashboard({ userId }) {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchTrips = async () => {
      const path = `apps/fleet-track-app/users/${userId}/trips`;
      const snapshot = await getDocs(collection(db, path));
      const tripList = snapshot.docs.map(doc => ({ ...doc.data(), tripId: doc.id }));
      setTrips(tripList);
      setFilteredTrips(tripList);
    };
    fetchTrips();
  }, [userId]);

  useEffect(() => {
    let filtered = [...trips];
    if (search) {
      filtered = filtered.filter(t =>
        t.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.origin?.toLowerCase().includes(search.toLowerCase()) ||
        t.destination?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    setFilteredTrips(filtered);
  }, [search, statusFilter, trips]);

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">🧾 Compliance Archive</h2>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search by driver, origin, destination"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md w-full md:w-1/2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <ComplianceExportPanel trips={filteredTrips} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrips.map(trip => (
          <TripSummaryCard key={trip.tripId} trip={trip} />
        ))}
      </div>
    </div>
  );
}