const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  driver_name: String,
  date: String,
  current_location: String,
  cycle_used: String,
  departure_time: String,
  end_time: String,
  duration: { type: Number, default: 0 }, // in hours

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

  stops: [{
    location: String,
    latitude: Number,
    longitude: Number,
    timestamp: String,
    remark: { type: String, default: 'No remark' },
  }],

  remarks: { type: String, default: 'No remarks recorded for this trip.' },
  routeData: { type: Object, default: null },

  status: {
    type: String,
    enum: ['pending', 'departed', 'completed', 'critical'],
    default: 'pending',
  },

  audit_hash: String,
  exportedAt: { type: Date, default: null },
  exportedBy: String,

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trip', TripSchema);