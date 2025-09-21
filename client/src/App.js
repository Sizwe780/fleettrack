import React, { useState, useEffect, useRef } from 'react';

// The main App component
const App = () => {
    const [trips, setTrips] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [refreshTrips, setRefreshTrips] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');

    // Load Mapbox GL JS and CSS from a CDN.
    useEffect(() => {
        const mapboxScript = document.createElement('script');
        mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js';
        mapboxScript.onload = () => {
            // Your Mapbox access token.
            window.mapboxgl.accessToken = 'pk.eyJ1Ijoic2l6d2VuZ3dlbnlhNzgiLCJhIjoiY2x1bWJ6dXh5MG4zZzJsczJ5ejQ5Y3VwYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';
        };

        const mapboxCss = document.createElement('link');
        mapboxCss.href = 'https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css';
        mapboxCss.rel = 'stylesheet';

        document.head.appendChild(mapboxCss);
        document.body.appendChild(mapboxScript);

        return () => {
            document.head.removeChild(mapboxCss);
            document.body.removeChild(mapboxScript);
        };
    }, []);

    // Set up the listener to get trip data from the Django API
    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await fetch('/api/trips/');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTrips(data);
            } catch (error) {
                console.error("Error fetching trips:", error);
            }
        };

        fetchTrips();
    }, [refreshTrips]);

    // Trip Form Component
    const TripForm = () => {
        const [origin, setOrigin] = useState('');
        const [destination, setDestination] = useState('');
        const [date, setDate] = useState('');
        const [driverName, setDriverName] = useState('');
        const [currentLocation, setCurrentLocation] = useState('');
        const [cycleUsed, setCycleUsed] = useState('');
        const [departureTime, setDepartureTime] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            const tripData = {
                driverName,
                origin,
                destination,
                date,
                currentLocation,
                cycleUsed: Number(cycleUsed),
                departureTime,
            };

            try {
                const response = await fetch('/api/trips/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tripData),
                });

                if (!response.ok) {
                    throw new Error('Failed to submit trip');
                }

                // Reset form fields
                setOrigin('');
                setDestination('');
                setDate('');
                setDriverName('');
                setCurrentLocation('');
                setCycleUsed('');
                setDepartureTime('');

                setModalMessage('Trip submitted successfully!');
                setIsSuccess(true);
                setShowModal(true);

                // Trigger a re-fetch of the trips list
                setRefreshTrips(prev => !prev);
            } catch (error) {
                console.error('Submission failed:', error);
                setModalMessage(`Failed to submit trip: ${error.message}`);
                setIsSuccess(false);
                setShowModal(true);
            }
        };

        return (
            <div className="form-container">
                <h2 className="form-title">Trip Log Form</h2>
                <form onSubmit={handleSubmit} className="trip-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="origin">Origin</label>
                            <input
                                id="origin"
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="destination">Destination</label>
                            <input
                                id="destination"
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="driverName">Driver's Name</label>
                            <input
                                id="driverName"
                                type="text"
                                value={driverName}
                                onChange={(e) => setDriverName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cycleUsed">Cycle Used (Hrs)</label>
                            <input
                                id="cycleUsed"
                                type="number"
                                value={cycleUsed}
                                onChange={(e) => setCycleUsed(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="departureTime">Departure Time</label>
                            <input
                                id="departureTime"
                                type="time"
                                value={departureTime}
                                onChange={(e) => setDepartureTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="currentLocation">Current Location</label>
                            <input
                                id="currentLocation"
                                type="text"
                                value={currentLocation}
                                onChange={(e) => setCurrentLocation(e.target.value)}
                                placeholder="Enter your current location..."
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row submit-row">
                        <button type="submit">Log Trip</button>
                    </div>
                </form>
            </div>
        );
    };

    // ELD Log Component
    const ELDLog = ({ trip }) => {
        const canvasRef = useRef(null);

        useEffect(() => {
            if (!trip || !canvasRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const hourToPx = (hour) => (hour / 24) * canvas.width;
            const minToPx = (min) => (min / 60) * (canvas.width / 24);

            const drawLine = (y, startMin, endMin, color = 'black', lineWidth = 3) => {
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                const startX = minToPx(startMin);
                const endX = minToPx(endMin);
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.stroke();
            };

            const drawLogSheet = (date, driverName, tripData) => {
                const yOffset = 50;
                const lineHeight = 40;

                ctx.fillStyle = '#000';
                ctx.font = 'bold 18px Arial';
                ctx.fillText(`Daily Log Sheet - ${date}`, 10, 30);
                ctx.font = '14px Arial';
                ctx.fillText(`Driver: ${driverName}`, 10, 50);

                ctx.font = '12px Arial';
                for (let i = 0; i < 25; i++) {
                    const x = hourToPx(i);
                    ctx.beginPath();
                    ctx.moveTo(x, yOffset + 10);
                    ctx.lineTo(x, yOffset + 15);
                    ctx.stroke();
                    if (i % 3 === 0) {
                        ctx.fillText(i.toString(), x - 5, yOffset);
                    }
                }

                const statusLines = [
                    { status: 'Off Duty', y: yOffset + lineHeight * 1 },
                    { status: 'Sleeper Berth', y: yOffset + lineHeight * 2 },
                    { status: 'Driving', y: yOffset + lineHeight * 3 },
                    { status: 'On Duty', y: yOffset + lineHeight * 4 },
                ];

                statusLines.forEach(line => {
                    ctx.font = '14px Arial';
                    ctx.fillText(line.status, 10, line.y - 10);
                    ctx.beginPath();
                    ctx.moveTo(0, line.y);
                    ctx.lineTo(canvas.width, line.y);
                    ctx.strokeStyle = '#ddd';
                    ctx.stroke();
                });

                const departureTimeParts = tripData.departureTime.split(':');
                const departureHours = parseInt(departureTimeParts[0], 10);
                const departureMinutes = (departureHours * 60) + parseInt(departureTimeParts[1], 10);
                const drivingDuration = tripData.cycleUsed * 60;
                const arrivalMinutes = departureMinutes + drivingDuration;

                drawLine(statusLines[2].y, departureMinutes, arrivalMinutes);
                drawLine(statusLines[3].y, departureMinutes, arrivalMinutes);
            };

            drawLogSheet(trip.date, trip.driverName, trip);

        }, [trip]);

        return (
            <div className="log-sheet-container">
                <h2 className="log-sheet-title">Daily ELD Log</h2>
                {trip ? (
                    <canvas ref={canvasRef} className="log-sheet-canvas"></canvas>
                ) : (
                    <p className="no-trip-message">Select a trip from the list to view its ELD log.</p>
                )}
            </div>
        );
    };

    // Map Component
    const TripMap = ({ trip }) => {
        const mapContainer = useRef(null);
        const map = useRef(null);

        useEffect(() => {
            if (!trip || !mapContainer.current || !window.mapboxgl) return;

            const getCoordinates = async (place) => {
                const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json?access_token=${window.mapboxgl.accessToken}`);
                const data = await response.json();
                if (data.features.length > 0) {
                    const [lng, lat] = data.features[0].center;
                    return { lng, lat };
                }
                return null;
            };

            const renderMap = async () => {
                const originCoords = await getCoordinates(trip.origin);
                const destinationCoords = await getCoordinates(trip.destination);
                const currentCoords = await getCoordinates(trip.currentLocation);

                if (!originCoords || !destinationCoords) {
                    console.error("Could not geocode origin or destination.");
                    return;
                }
                
                if (map.current) {
                    map.current.remove();
                }

                map.current = new window.mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [originCoords.lng, originCoords.lat],
                    zoom: 6,
                });

                map.current.on('load', async () => {
                    new window.mapboxgl.Marker({ color: 'green' }).setLngLat([originCoords.lng, originCoords.lat]).setPopup(new window.mapboxgl.Popup().setText('Origin')).addTo(map.current);
                    new window.mapboxgl.Marker({ color: 'red' }).setLngLat([destinationCoords.lng, destinationCoords.lat]).setPopup(new window.mapboxgl.Popup().setText('Destination')).addTo(map.current);
                    if (currentCoords) {
                        new window.mapboxgl.Marker({ color: 'blue' }).setLngLat([currentCoords.lng, currentCoords.lat]).setPopup(new window.mapboxgl.Popup().setText('Current Location')).addTo(map.current);
                    }

                    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords.lng},${originCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?geometries=geojson&access_token=${window.mapboxgl.accessToken}`;
                    try {
                        const response = await fetch(url);
                        const data = await response.json();
                        const route = data.routes[0].geometry;

                        if (map.current.getSource('route')) {
                            map.current.getSource('route').setData(route);
                        } else {
                            map.current.addLayer({
                                id: 'route',
                                type: 'line',
                                source: {
                                    type: 'geojson',
                                    data: {
                                        type: 'Feature',
                                        properties: {},
                                        geometry: route,
                                    },
                                },
                                layout: {
                                    'line-join': 'round',
                                    'line-cap': 'round',
                                },
                                paint: {
                                    'line-color': '#3b82f6',
                                    'line-width': 6,
                                },
                            });
                        }

                        const bounds = new window.mapboxgl.LngLatBounds();
                        for (const coord of route.coordinates) {
                            bounds.extend(coord);
                        }
                        map.current.fitBounds(bounds, {
                            padding: 100
                        });

                    } catch (error) {
                        console.error('Error fetching route:', error);
                    }
                });
                
                return () => {
                    if (map.current) {
                        map.current.remove();
                    }
                };
            };
            renderMap();
        }, [trip]);

        return (
            <div className="map-container">
                <h2 className="map-title">Trip Map</h2>
                {trip ? (
                    <div ref={mapContainer} className="map-canvas"></div>
                ) : (
                    <p className="no-trip-message">Select a trip from the list to view its route on the map.</p>
                )}
            </div>
        );
    };

    // Trip List Component
    const TripList = ({ trips, setSelectedTrip }) => {
        return (
            <div className="trip-list-container">
                <h2 className="trip-list-title">Your Logged Trips</h2>
                {trips.length > 0 ? (
                    <div className="trip-items">
                        {trips.map(trip => (
                            <div
                                key={trip._id}
                                className="trip-item"
                                onClick={() => {
                                    setSelectedTrip(trip);
                                    setCurrentPage('log');
                                }}
                            >
                                <p className="trip-driver-name">{trip.driverName}</p>
                                <p className="trip-info">Trip ID: {trip._id}</p>
                                <div className="trip-details">
                                    <p>From: {trip.origin}</p>
                                    <p>To: {trip.destination}</p>
                                    <p>Date: {trip.date}</p>
                                    <p>Departure: {trip.departureTime}</p>
                                    <p>Current Location: {trip.currentLocation}</p>
                                    <p>Cycle Used: {trip.cycleUsed} Hrs</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-trips-message">No trips logged yet.</p>
                )}
            </div>
        );
    };

    // Modal Component
    const Modal = ({ message, isSuccess, onClose }) => {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3 className={`modal-title ${isSuccess ? 'success' : 'error'}`}>
                        {isSuccess ? 'Success!' : 'Error'}
                    </h3>
                    <p className="modal-message">{message}</p>
                    <div className="modal-actions">
                        <button
                            onClick={onClose}
                            className="modal-button"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const Navbar = () => {
        return (
            <nav className="navbar">
                <div className="navbar-brand" onClick={() => setCurrentPage('home')}>FleetTrack</div>
                <div className="navbar-links">
                    <button className={currentPage === 'home' ? 'active' : ''} onClick={() => setCurrentPage('home')}>Home</button>
                    <button className={currentPage === 'trips' ? 'active' : ''} onClick={() => setCurrentPage('trips')}>Trips</button>
                    <button className={currentPage === 'log' ? 'active' : ''} onClick={() => setCurrentPage('log')}>Log & Map</button>
                </div>
            </nav>
        );
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <TripForm />;
            case 'trips':
                return <TripList trips={trips} setSelectedTrip={setSelectedTrip} />;
            case 'log':
                return (
                    <>
                        <TripMap trip={selectedTrip} />
                        <ELDLog trip={selectedTrip} />
                    </>
                );
            default:
                return <TripForm />;
        }
    };

    return (
        <div className="home-container">
            <Navbar />
            <h1 className="welcome-message">Welcome to FleetTrack</h1>
            {renderPage()}
            <div className="contact-footer">
                <h3>Reach out... </h3>
                sizwe.ngwenya78@gmail.com
            </div>
            {showModal && (
                <Modal
                    message={modalMessage}
                    isSuccess={isSuccess}
                    onClose={() => setShowModal(false)}
                />
            )}
            <style jsx>{`
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                    font-family: 'Segoe UI', sans-serif;
                }
                .home-container {
                    padding: 25px 2rem;
                    min-height: 80vh;
                    box-sizing: border-box;
                }
                .navbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #ffffff;
                    padding: 1rem 2rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }
                .navbar-brand {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #007bff;
                    cursor: pointer;
                }
                .navbar-links button {
                    background: none;
                    border: none;
                    font-size: 1rem;
                    margin-left: 1.5rem;
                    cursor: pointer;
                    color: #555;
                    transition: color 0.2s ease;
                }
                .navbar-links button:hover,
                .navbar-links button.active {
                    color: #007bff;
                    font-weight: 600;
                }
                .welcome-message {
                    text-align: center;
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 2rem;
                }
                .form-container, .map-container, .log-sheet-container, .trip-list-container {
                    max-width: 900px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
                    padding: 2.5rem;
                }
                .form-title, .map-title, .log-sheet-title, .trip-list-title {
                    font-size: 18px;
                    font-weight: 500;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }
                .trip-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .form-row {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                }
                .form-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    min-width: 250px;
                }
                .form-group.full-width {
                    flex-basis: 100%;
                }
                .form-group label {
                    font-weight: 500;
                    color: #555;
                }
                .form-group input {
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 1rem;
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
                }
                .submit-row {
                    justify-content: center;
                }
                .submit-row button {
                    padding: 0.75rem 2rem;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                .submit-row button:hover {
                    background-color: #0056b3;
                }
                .map-canvas, .log-sheet-canvas {
                    width: 100%;
                    height: 400px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
                }
                .no-trip-message {
                    text-align: center;
                    color: #777;
                    font-style: italic;
                    padding: 2rem 0;
                }
                .trip-items {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .trip-item {
                    border: 1px solid #f0f0f0;
                    border-radius: 8px;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                }
                .trip-item:hover {
                    background-color: #f9f9f9;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .trip-driver-name {
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 0.5rem;
                }
                .trip-info, .trip-details {
                    font-size: 0.9rem;
                    color: #666;
                }
                .contact-footer {
                    text-align: center;
                    margin-top: 3rem;
                    font-size: 0.9rem;
                    color: #888;
                }
                .contact-footer h3 {
                    margin: 0;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background-color: white;
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                }
                .modal-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                }
                .modal-title.success { color: #28a745; }
                .modal-title.error { color: #dc3545; }
                .modal-message {
                    font-size: 1rem;
                    color: #555;
                    margin-bottom: 1.5rem;
                }
                .modal-button {
                    padding: 0.5rem 1.5rem;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                .modal-button:hover {
                    background-color: #0056b3;
                }
                @media (min-width: 768px) {
                    .trip-form {
                        flex-direction: row;
                        flex-wrap: wrap;
                    }
                    .form-group {
                        flex: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default App;
