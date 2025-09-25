import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Logs a fleet alert to Firestore for cockpit visibility.
 * Used across TripPlanner, Dashboard, Export, SLA breach, and Risk modules.
 *
 * @param {Object} alert - Alert payload
 * @param {string} alert.type - 'status' | 'risk' | 'sla'
 * @param {string} alert.message - Human-readable alert message
 * @param {string} alert.tripId - Associated trip ID
 */
export const logFleetAlert = async ({ type, message, tripId }) => {
  if (!type || !message || !tripId) {
    console.warn('Alert skipped: missing required fields');
    return;
  }

  try {
    await addDoc(collection(db, 'apps/fleet-track-app/alerts'), {
      type,
      message,
      tripId,
      timestamp: Timestamp.now(),
    });
    console.log(`Alert logged: [${type}] ${message}`);
  } catch (err) {
    console.error('Alert logging failed:', err.message);
  }
};