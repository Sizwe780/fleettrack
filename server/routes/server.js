const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// All other routes remain the same...
app.use('/api/trips', require('./routes/trips')); // Only keep this one.
// You must remove the duplicate line from your code.
app.use('/api/fleet-summary', require('./routes/fleetSummary'));
app.use('/api/compliance-score', require('./routes/complianceScore'));
app.use('/api/incidents', require('./routes/incidents'));
const logPushRoutes = require('./routes/logPush');
app.use('/api/log-push', logPushRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'FleetTrack v3.0 backend is live  🚀 ' });
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(PORT, () => {
  console.log(` ✅  FleetTrack v3.0 backend running on port ${PORT}`);
});