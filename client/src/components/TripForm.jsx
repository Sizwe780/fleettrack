import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TripLogsheet from './TripLogsheet';
import validateTripPayload from '../utils/tripValidator';
import detectTripAnomalies from '../utils/tripAnomalyDetector';

export default function TripForm({ onTripCreated }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [submittedTrip, setSubmittedTrip] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation(`${latitude}, ${longitude}`);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setStatusMessage('Geolocation is not available or permission was denied.');
        }
      );
    } else {
      setStatusMessage('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!origin || !destination || !date || !driverName || !currentLocation || !cycleUsed || !departureTime) {
      setStatusMessage('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Submitting trip...');
    setSubmittedTrip(null);

    const tripData = {
      origin,
      destination,
      date,
      driver_name: driverName,
      current_location: currentLocation,
      cycle_used: cycleUsed,
      departure_time: departureTime,
    };

    const validationError = validateTripPayload(tripData);
    if (validationError) {
      setStatusMessage(`Trip rejected: ${validationError}`);
      setIsSubmitting(false);
      return;
    }

    const anomalies = detectTripAnomalies(tripData);
    console.log('Detected anomalies:', anomalies);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/trips`, tripData);

      setStatusMessage('Trip submitted successfully!');
      setSubmittedTrip(response.data);
      if (onTripCreated) onTripCreated(response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);
      setStatusMessage(`Failed to submit trip. Please check your backend API.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form JSX here */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Trip'}
      </button>
      {statusMessage && <p>{statusMessage}</p>}
      {submittedTrip && <TripLogsheet trip={submittedTrip} />}
    </form>
  );
}