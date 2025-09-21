const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

router.post('/', async (req, res) => {
  const trip = new Trip(req.body);
  await trip.save();
  res.status(201).json(trip);
});

router.get('/', async (req, res) => {
  const trips = await Trip.find();
  res.status(200).json(trips);
});

module.exports = router;