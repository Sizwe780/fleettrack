import { useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';

export const useSecureSnapshot = (ref, onData, onError) => {
  useEffect(() => {
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => onData(snapshot),
      (error) => {
        console.error('Snapshot error:', error.message);
        onError?.(error);
      }
    );

    return () => unsubscribe();
  }, [ref]);
};