import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function completeTrip(trip) {
  const ref = doc(db, 'trips', trip.id);
  const timestamp = new Date().toISOString();

  await updateDoc(ref, {
    status: 'completed',
    completedAt: timestamp
  });

  await addDoc(collection(db, 'audit_logs'), {
    actor: trip.driver_name,
    action: 'Completed trip',
    tripId: trip.id,
    timestamp
  });
}