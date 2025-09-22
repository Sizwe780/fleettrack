// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAla1ZaxyeLc9WBDvKbAS8I9hUZnxIWxPg",
  authDomain: "fleettrack-84eb6.firebaseapp.com",
  projectId: "fleettrack-84eb6",
  storageBucket: "fleettrack-84eb6.appspot.com", // corrected domain
  messagingSenderId: "918797565578",
  appId: "1:918797565578:web:34dfa9992cd5a4a3cbf773"
  // measurementId is optional and not needed unless you're using analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);