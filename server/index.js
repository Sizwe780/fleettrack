const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'https://fleettrack-frontend.vercel.app' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running' });
});

const tripRoutes = require('./routes/tripRoutes');
app.use('/trips', tripRoutes);

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000))
  .catch(err => console.error(err));