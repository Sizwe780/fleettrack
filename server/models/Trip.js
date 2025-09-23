const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  driver_name: String,
  date: String,
  current_location: String,
  cycle_used: String,
  departure_time: String,
  origin: {
    location: String,
    latitude: Number,
    longitude: Number,
  },
  destination: {
    location: String,
    latitude: Number,
    longitude: Number,
  },
  remarks: {
    type: String,
    default: 'No remarks recorded for this trip.',
  },
  routeData: {
    type: Object,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'departed', 'completed', 'critical'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Trip', TripSchema);