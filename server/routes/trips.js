const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { collection, addDoc } = require('firebase/firestore');

router.post('/', async (req, res) => {
  try {
    const { driverId, startLocation, endLocation, cargoType, notes } = req.body;
    const path = `apps/fleet-track-app/trips`;
    const docRef = await addDoc(collection(db, path), {
      driverId,
      startLocation,
      endLocation,
      cargoType,
      notes,
      timestamp: new Date().toISOString(),
      status: 'submitted'
    });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Trip submission failed:', err);
    res.status(500).json({ error: 'Trip submission failed' });
  }
});

module.exports = router;