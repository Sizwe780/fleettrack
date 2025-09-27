// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging-compat.js');

// Initialize Firebase inside the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAla1ZaxyeLc9WBDvKbAS8I9hUZnxIWxPg",
  projectId: "fleettrack-84eb6",
  messagingSenderId: "918797565578",
  appId: "1:918797565578:web:8c8ee2b227057e21cbf773"
});

const messaging = firebase.messaging();

// ✅ Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'FleetTrack Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new trip update.',
    icon: '/logo192.png' // Customize this path if needed
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🛡️ Optional: Prevent async handshake errors
self.addEventListener("message", (event) => {
  if (event.data && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ ack: true });
  }
});