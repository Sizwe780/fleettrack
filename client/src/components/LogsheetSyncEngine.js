import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export const syncLogEntry = async (tripId, entry) => {
  const path = `apps/fleet-track-app/trips/${tripId}/logsheet`;
  await addDoc(collection(db, path), {
    ...entry,
    syncedAt: new Date().toISOString(),
  });
};