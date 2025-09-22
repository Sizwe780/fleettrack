import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { updateFleetHealth } from '../../lib/updateFleetHealth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { trip, vehicleId } = req.body;
  if (!trip || !vehicleId) return res.status(400).json({ error: 'Missing data' });

  const driverRef = doc(db, 'users', trip.driver_uid);
  const adminRef = doc(db, 'users', 'admin'); // Replace with actual admin UID

  const driverSnap = await getDoc(driverRef);
  const adminSnap = await getDoc(adminRef);

  const driverToken = driverSnap.exists() ? driverSnap.data().fcmToken : null;
  const adminToken = adminSnap.exists() ? adminSnap.data().fcmToken : null;

  await updateFleetHealth(vehicleId, trip, driverToken, adminToken);
  res.status(200).json({ success: true });
}