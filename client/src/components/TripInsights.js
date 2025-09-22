import React, { useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';

const TripInsights = () => {
  useEffect(() => {
    const signIn = async () => {
      try {
        const userCredential = await signInAnonymously(auth);
        console.log('Signed in anonymously:', userCredential.user.uid);
      } catch (error) {
        console.error('Auth error:', error);
      }
    };

    signIn();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Trip Insights</h2>
      <p className="text-gray-600">Coming soon: route analysis, fuel breakdown, and profitability metrics.</p>
    </div>
  );
};

export default TripInsights;