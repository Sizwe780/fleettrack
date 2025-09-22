import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAla1ZaxyeLc9WBDvKbAS8I9hUZnxIWxPg",
  authDomain: "fleettrack-84eb6.firebaseapp.com",
  projectId: "fleettrack-84eb6",
  storageBucket: "fleettrack-84eb6.appspot.com",
  messagingSenderId: "918797565578",
  appId: "1:918797565578:web:34dfa9992cd5a4a3cbf773"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);