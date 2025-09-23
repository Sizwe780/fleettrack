import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useRBAC = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) {
          console.warn('RBAC: No authenticated user found.');
          setRole(null);
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid)); // ✅ matches Firestore rules
        if (!userDoc.exists()) {
          console.warn(`RBAC: No role document found for UID ${user.uid}`);
          setRole('driver'); // fallback to default role
        } else {
          setRole(userDoc.data().role || 'driver');
        }
      } catch (err) {
        console.error('RBAC fetch error:', err.message);
        setRole('driver'); // fallback on error
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return {
    role,
    isDriver: role === 'driver',
    isAdmin: role === 'admin',
    isFleetManager: role === 'fleet_manager',
    loading,
  };
};