const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicleId: String,
  pickup: String,
  dropoff: String,
  cycleHours: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);