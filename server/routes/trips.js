const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin'); // ✅ Use admin SDK
const { Timestamp } = require('firebase-admin/firestore');

router.post('/', async (req, res) => {
  try {
    const { driverId, startLocation, endLocation, cargoType, notes } = req.body;

    // Optional: Validate required fields
    if (!driverId || !startLocation || !endLocation || !cargoType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const path = `apps/fleet-track-app/trips`;
    const docRef = await db.collection(path).add({
      driverId,
      startLocation,
      endLocation,
      cargoType,
      notes,
      timestamp: Timestamp.now(),
      status: 'submitted'
    });

    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Trip submission failed:', err.message);
    res.status(500).json({ error: 'Trip submission failed' });
  }
});

module.exports = router;