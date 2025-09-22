// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // 🔐 Paste your Firebase config here
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    match /trips/{tripId} {
      allow read, write: if isDriver() || isManager() || isPremium();
    }

    function isDriver() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "driver";
    }

    function isManager() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "manager";
    }

    function isPremium() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "premium";
    }
  }
}