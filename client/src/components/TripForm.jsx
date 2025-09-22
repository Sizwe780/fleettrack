import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { callTripAnalysis } from '../utils/callTripAnalysis';



function TripForm() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [departureTime, setDepartureTime] = useState('');

  // This effect gets the user's current location on component mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation(`${latitude},${longitude}`);
      },
      (err) => console.error('Geolocation error:', err)
    );
  }, []);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const tripData = {
      origin,
      destination,
      date,
      driver_name: driverName,
      current_location: currentLocation,
      cycle_used: Number(cycleUsed),
      departure_time: departureTime,
      ratePerMile: 3.5,
      fuelMpg: 6.5,
      fuelPrice: 3.89,
      otherCosts: 125
    };
  
    try {
      // Step 1: Get full trip analysis from Django
      const analysisRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/calculate-trip/`, tripData);
      const analysis = analysisRes.data;
  
      // Step 2: Save full trip to your backend or Firebase
      const fullTrip = {
        ...tripData,
        analysis,
        createdAt: new Date().toISOString()
      };
  
      await axios.post(`${process.env.REACT_APP_API_URL}/api/trips/`, fullTrip);
  
      // Step 3: Reset form
      setOrigin('');
      setDestination('');
      setDate('');
      setDriverName('');
      setCurrentLocation('');
      setCycleUsed('');
      setDepartureTime('');
  
      alert('Trip submitted and analyzed successfully!');
    } catch (error) {
      console.error('Submission failed:', error.response?.data || error.message);
      alert('Failed to submit trip.');
    }
  };
  
  return (
    <div className="home-container">
      <div className="form-container">
        <h2 className="form-title">Trip Details Form</h2>
        <form className="trip-form" onSubmit={handleSubmit}>
          {/* Input fields */}
          <div className="form-row">
            <div className="form-group">
              <label>Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Departure Time</label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Driver Name</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Cycle Used (Hrs)</label>
              <input
                type="number"
                value={cycleUsed}
                onChange={(e) => setCycleUsed(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group location-group">
              <label>Current Location</label>
              <input
                type="text"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                readOnly
              />
            </div>
            <div className="form-group location-group">
              <label>Location</label>
              <div className={`location-indicator ${currentLocation ? 'active' : ''}`}></div>
            </div>
          </div>
          <div className="form-row submit-row">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
      <div className="contact-footer">
        <h3>Reach out... </h3>
        sizwe.ngwenya78@gmail.com
      </div>
    </div>
  );
}

export default TripForm;
