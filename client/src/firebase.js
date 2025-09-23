// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyAla1ZaxyeLc9WBDvKbAS8I9hUZnxIWxPg',
  authDomain: 'fleettrack-84eb6.firebaseapp.com',
  projectId: 'fleettrack-84eb6',
  storageBucket: 'fleettrack-84eb6.appspot.com',
  messagingSenderId: '918797565578',
  appId: '1:918797565578:web:34dfa9992cd5a4a3cbf773'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optional: Check if messaging is supported before initializing
export const messaging = (await isSupported()) ? getMessaging(app) : null;