import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import validateTripPayload from '../utils/tripValidator';
import detectTripAnomalies from '../utils/tripAnomalyDetector';
import TripLogsheet from './TripLogsheet';
import { useNavigate } from 'react-router-dom';

export default function TripForm({ userId, onTripCreated }) {
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
      userId,
      // Add a placeholder for remarks, to be filled out by the backend
      remarks: 'No remarks recorded for this trip.',
    };

    try {
      const validationError = validateTripPayload(tripData);
      if (validationError) {
        setStatusMessage(`Trip rejected: ${validationError}`);
        setIsSubmitting(false);
        return;
      }

      const anomalies = detectTripAnomalies(tripData);
      console.log('Detected anomalies:', anomalies);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/trips`, tripData);

      setStatusMessage('Trip submitted successfully!');
      // Assuming your backend returns the full trip object, including any new fields
      setSubmittedTrip(response.data);
      onTripCreated(response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      setStatusMessage(`Failed to submit trip. Please check your backend API.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form JSX for input fields goes here. */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Trip'}
      </button>
      {statusMessage && <p>{statusMessage}</p>}
      {submittedTrip && <TripLogsheet trip={submittedTrip} />}
    </form>
  );
}