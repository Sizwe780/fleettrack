import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export const syncOfflineTrips = async (appId, userId) => {
  const drafts = JSON.parse(localStorage.getItem('fleettrack_trip_drafts') || '[]');
  if (drafts.length === 0) return;

  for (const trip of drafts) {
    const payload = {
      ...trip,
      driver_uid: userId,
      createdAt: new Date(),
    };
    await addDoc(collection(db, `apps/${appId}/trips`), payload);
  }

  localStorage.removeItem('fleettrack_trip_drafts');
};