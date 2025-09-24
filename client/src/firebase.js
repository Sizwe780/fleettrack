import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging"; // ✅ Add this

const firebaseConfig = {
  apiKey: "AIzaSyAla1ZaxyeLc9WBDvKbAS8I9hUZnxIWxPg",
  authDomain: "fleettrack-84eb6.firebaseapp.com",
  projectId: "fleettrack-84eb6",
  storageBucket: "fleettrack-84eb6.firebasestorage.app",
  messagingSenderId: "918797565578",
  appId: "1:918797565578:web:8c8ee2b227057e21cbf773",
  measurementId: "G-EQT2H5SQ4V"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const messaging = getMessaging(app); // ✅ Initialize messaging

export { db, analytics, messaging }; // ✅ Export it