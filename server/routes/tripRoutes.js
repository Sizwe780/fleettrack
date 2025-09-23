const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const axios = require('axios');

async function geocode(locationName) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`;
  try {
    const response = await axios.get(url);
    if (!response.data.features || response.data.features.length === 0) {
      console.warn(`Geocoding failed for: ${locationName}`);
      return { location: locationName, latitude: 0, longitude: 0 };
    }
    const [longitude, latitude] = response.data.features[0].geometry.coordinates;
    return { location: locationName, latitude, longitude };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return { location: locationName, latitude: 0, longitude: 0 };
  }
}

async function getRouteData(origin, destination) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`;
  try {
    const response = await axios.get(url);
    return response.data.routes[0].geometry;
  } catch (error) {
    console.error('Routing error:', error.message);
    return { type: 'LineString', coordinates: [] };
  }
}

router.post('/', async (req, res) => {
  try {
    const { origin, destination, ...otherTripData } = req.body;

    const originCoords = await geocode(origin);
    const destinationCoords = await geocode(destination);
    const routeData = await getRouteData(originCoords, destinationCoords);

    const remarks = `Trip from ${originCoords.location} to ${destinationCoords.location} has been successfully logged.`;

    const newTrip = new Trip({
      ...otherTripData,
      origin: originCoords,
      destination: destinationCoords,
      remarks,
      routeData,
    });

    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Trip submission failed:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find();
    res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;