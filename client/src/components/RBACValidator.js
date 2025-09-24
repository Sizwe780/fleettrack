import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Validates whether a given role has permission to perform a specific action.
 * @param {string} role - The role to validate (e.g., 'driver', 'fleet_manager', 'admin')
 * @param {string} action - The action to check (e.g., 'submitTrips', 'exportTrips')
 * @returns {Promise<boolean>} - True if allowed, false otherwise
 */
export async function validatePermission(role, action) {
  if (!role || !action) return false;

  try {
    const ref = doc(db, 'apps/fleet-track-app/rbac', role);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const matrix = snap.data();
    return matrix[action] === true;
  } catch (err) {
    console.error('RBACValidator error:', err.message);
    return false;
  }
}