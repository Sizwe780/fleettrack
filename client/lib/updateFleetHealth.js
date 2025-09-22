import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { sendPushNotification } from './sendPushNotification';

export const calculateHealthScore = (trip) => {
  const fuelUsed = trip.analysis?.ifta?.fuelUsed ?? 0;
  const engineTemp = trip.analysis?.engine?.temperature ?? 0;
  const delayMinutes = trip.analysis?.timing?.delay ?? 0;

  let score = 100;
  if (fuelUsed > 300) score -= 10;
  if (engineTemp > 95) score -= 15;
  if (delayMinutes > 30) score -= 5;

  return Math.max(score, 0);
};

export const updateFleetHealth = async (vehicleId, trip, driverToken, adminToken) => {
  const score = calculateHealthScore(trip);
  const monthId = new Date().toISOString().slice(0, 7); // e.g. "2025-09"

  await setDoc(doc(db, 'fleet_health', vehicleId), {
    lastUpdated: new Date().toISOString(),
    lastScore: score,
    tripId: trip.id
  }, { merge: true });

  await setDoc(doc(db, `fleet_health/${vehicleId}/monthly_scores`, monthId), {
    score,
    timestamp: new Date().toISOString()
  });

  if (score < 60 && adminToken) {
    await sendPushNotification(adminToken, 'Fleet Health Warning', `Vehicle ${vehicleId} scored ${score}`);
  }

  if (driverToken) {
    await sendPushNotification(driverToken, 'Trip Health Summary', `Your trip scored ${score}.`);
  }
};