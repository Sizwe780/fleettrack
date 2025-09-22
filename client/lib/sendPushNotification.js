import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Load service account from uploaded file
const serviceAccountPath = path.resolve('fleettrack-84eb6-firebase-adminsdk-fbsvc-9fd55e055c.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const sendPushNotification = async (token, title, body) => {
  const message = {
    notification: { title, body },
    token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};