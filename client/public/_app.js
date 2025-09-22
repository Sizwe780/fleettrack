// pages/_app.js

import { useEffect } from 'react';
import { messaging } from '../src/firebase';
import { getToken } from 'firebase/messaging';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            getToken(messaging, {
              vapidKey: 'BGg5o1gxS60Zbw8_XVKalgqAQv4G-wnzx5AQnYryf-J4I5kHf86xRREOW2MRuxNiRk7UMol_YguUfaUw67cv7bY'
            }).then(token => {
              console.log('FCM Token:', token);
              // TODO: Save token to Firestore or backend
            }).catch(err => {
              console.error('FCM token error:', err);
            });
          }
        });
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;