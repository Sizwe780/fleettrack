const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { collection, addDoc } = require('firebase/firestore');

router.post('/', async (req, res) => {
  const { message, sender, timestamp } = req.body;

  try {
    await addDoc(collection(db, 'apps/fleet-track-app/logs/push'), {
      message,
      sender,
      timestamp: timestamp || new Date().toISOString()
    });

    console.log(`[📨 Push Logged] ${message} from ${sender}`);
    res.status(201).json({ status: 'logged' });
  } catch (err) {
    console.error('Push log failed:', err);
    res.status(500).json({ error: 'Push log failed' });
  }
});

module.exports = router;