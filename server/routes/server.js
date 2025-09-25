const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core FleetTrack routes
app.use('/api/trips/submit', require('./routes/trips'));
app.use('/api/fleet-summary', require('./routes/fleetSummary'));
app.use('/api/compliance-score', require('./routes/complianceScore'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/log-push', require('./routes/logPush'));

// ✅ New: Auth routes for register/login/profile
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'FleetTrack v3.0 backend is live  🚀 ' });
});

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server start
app.listen(PORT, () => {
  console.log(` ✅  FleetTrack v3.0 backend running on port ${PORT}`);
});