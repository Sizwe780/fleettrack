import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useRBAC = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      setRole(userDoc.exists() ? userDoc.data().role : null);
      setLoading(false);
    };

    fetchRole();
  }, []);

  return {
    role,
    isDriver: role === 'driver',
    isAdmin: role === 'admin',
    loading,
  };
};