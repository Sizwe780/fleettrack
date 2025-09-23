const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/delivery', require('./delivery'));
app.use('/api/export/compliance', require('./exportCompliance'));
app.use('/api/driver-locations', require('./driverLocations'));
app.use('/api/shift-optimize', require('./shiftOptimizer'));
app.use('/api/leaderboard', require('./leaderboard'));
// Optional: Incident, Handoff, Sentiment, Audit
app.use('/api/incident', require('./incident'));
app.use('/api/handoff', require('./routes/handoff'));
app.use('/api/sentiment', require('./routes/sentiment'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/release-checklist', require('./routes/releaseChecklist'));
app.use('/api/patch-registry', require('./routes/patchRegistry'));
app.use('/api/toggles', require('./routes/toggles'));
app.use('/api/feature-audit', require('./routes/featureAudit'));
app.use('/api/deployment-timeline', require('./routes/deploymentTimeline'));
app.use('/api/admin/users', require('./routes/adminUsers'));
app.use('/api/trips/submit', require('./routes/trips')); // 💡 This is the correct route
// ❌ You MUST find and remove the duplicate line like this one:
// app.use('/api/trips', require('./routes/trips'));
app.use('/api/fleet-summary', require('./routes/fleetSummary'));
app.use('/api/compliance-score', require('./routes/complianceScore'));
app.use('/api/incidents', require('./routes/incidents'));
const logPushRoutes = require('./routes/logPush');
app.use('/api/log-push', logPushRoutes);
// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'FleetTrack v3.0 backend is live  🚀 ' });
});
// Serve frontend (optional)
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Start server
app.listen(PORT, () => {
  console.log(` ✅  FleetTrack v3.0 backend running on port ${PORT}`);
});