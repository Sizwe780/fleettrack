import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { messaging } from './firebase'; // ✅ Import messaging

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ Register service worker (no useServiceWorker needed)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(() => {
      console.log('Service Worker registered for Firebase Messaging');
    })
    .catch(err => {
      console.error('Service Worker registration failed:', err);
    });
}