import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';

// Global variables provided by the environment
const __app_id = 'default-app-id';
const __firebase_config = {}; // You need to replace this with your actual config
const __initial_auth_token = null;

// Your Mapbox access token.
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2VuZ3dlbnlhNzgiLCJhIjoiY2x1bWJ6dXh5MG4zZzJsczJ5ejQ5Y3VwYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

// The main App component
const App = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Initialize Firebase and authenticate the user
    useEffect(() => {
        try {
            if (Object.keys(__firebase_config).length > 0) {
                const app = initializeApp(__firebase_config);
                const firestoreDb = getFirestore(app);
                const authService = getAuth(app);
                setDb(firestoreDb);
                setAuth(authService);
                
                const signIn = async () => {
                    try {
                        if (__initial_auth_token) {
                            await signInWithCustomToken(authService, __initial_auth_token);
                        } else {
                            await signInAnonymously(authService);
                        }
                    } catch (error) {
                        console.error("Firebase Auth error:", error);
                    } finally {
                        setIsAuthReady(true);
                    }
                };

                onAuthStateChanged(authService, user => {
                    if (user) {
                        setUserId(user.uid);
                        console.log("Authenticated user:", user.uid);
                    } else {
                        console.log("No user is signed in. Signing in anonymously...");
                        signIn();
                    }
                });

            } else {
                console.warn("Firebase config is missing. The app will not save data.");
                setIsAuthReady(true);
            }
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setIsAuthReady(true);
        }
    }, []);

    // Set up the Firestore listener to get real-time trip data
    useEffect(() => {
        if (db && userId && isAuthReady) {
            const tripsCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/trips`);
            const q = query(tripsCollectionRef, orderBy("timestamp", "desc"));

            const unsubscribe = onSnapshot(q, snapshot => {
                const fetchedTrips = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTrips(fetchedTrips);
            }, error => {
                console.error("Error fetching trips:", error);
            });

            return () => unsubscribe();
        }
    }, [db, userId, isAuthReady]);

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
            if (!db || !userId) {
                setModalMessage('Database not ready. Please try again.');
                setIsSuccess(false);
                setShowModal(true);
                return;
            }
            try {
                const tripData = {
                    origin,
                    destination,
                    date,
                    driverName,
                    currentLocation,
                    cycleUsed: Number(cycleUsed),
                    departureTime,
                    timestamp: serverTimestamp(),
                };

                const tripsCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/trips`);
                await addDoc(tripsCollectionRef, tripData);

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
            } catch (error) {
                console.error('Submission failed:', error);
                setModalMessage(`Failed to submit trip: ${error.message}`);
                setIsSuccess(false);
                setShowModal(true);
            }
        };

        return (
            <div className="form-container bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-center text-xl font-semibold mb-6 text-gray-800">Trip Log Form</h2>
                <form onSubmit={handleSubmit} className="trip-form">
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="flex flex-col">
                            <label htmlFor="origin" className="text-gray-600 font-medium mb-1">Origin</label>
                            <input
                                id="origin"
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 ease-in-out"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="destination" className="text-gray-600 font-medium mb-1">Destination</label>
                            <input
                                id="destination"
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 ease-in-out"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="date" className="text-gray-600 font-medium mb-1">Date</label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 ease-in-out"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="driverName" className="text-gray-600 font-medium mb-1">Driver's Name</label>
                            <input
                                id="driverName"
                                type="text"
                                value={driverName}
                                onChange={(e) => setDriverName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 ease-in-out"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="cycleUsed" className="text-gray-600 font-medium mb-1">Cycle Used (Hrs)</label>
                            <input
                                id="cycleUsed"
                                type="number"
                                value={cycleUsed}
                                onChange={(e) => setCycleUsed(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 ease-in-out"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="departureTime" className="text-gray-600 font-medium mb-1">Departure Time</label>
                            <input
                                id="departureTime"
                                type="time"
                                value={departureTime}
                                onChange={(e) => setDepartureTime(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 ease-in-out"
                                required
                            />
                        </div>
                        <div className="flex flex-col md:col-span-2">
                            <label htmlFor="currentLocation" className="text-gray-600 font-medium mb-1">Current Location</label>
                            <div className="relative">
                                <input
                                    id="currentLocation"
                                    type="text"
                                    value={currentLocation}
                                    onChange={(e) => setCurrentLocation(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 ease-in-out pr-10"
                                    placeholder="Enter your current location..."
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-center">
                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out">Log Trip</button>
                    </div>
                </form>
            </div>
        );
    };

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

                const departureMinutes = new Date(`2000-01-01T${tripData.departureTime}`).getHours() * 60 + new Date(`2000-01-01T${tripData.departureTime}`).getMinutes();
                const drivingDuration = tripData.cycleUsed * 60;
                const arrivalMinutes = departureMinutes + drivingDuration;

                drawLine(statusLines[2].y, departureMinutes, arrivalMinutes);
                drawLine(statusLines[3].y, departureMinutes, arrivalMinutes);
            };

            drawLogSheet(trip.date, trip.driverName, trip);

        }, [trip]);

        return (
            <div className="bg-white p-8 rounded-xl shadow-lg mt-8">
                <h2 className="text-center text-xl font-semibold mb-6 text-gray-800">Daily ELD Log</h2>
                {trip ? (
                    <canvas ref={canvasRef} className="w-full h-96 border border-gray-300 rounded-lg shadow-inner"></canvas>
                ) : (
                    <p className="text-center text-gray-500 italic">Select a trip from the list to view its ELD log.</p>
                )}
            </div>
        );
    };

    const TripMap = ({ trip }) => {
        const mapContainer = useRef(null);
        const map = useRef(null);

        useEffect(() => {
            if (!trip || !window.mapboxgl || !mapContainer.current) return;

            const getCoordinates = async (place) => {
                const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`);
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

                    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords.lng},${originCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
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
            <div className="bg-white p-8 rounded-xl shadow-lg mt-8">
                <h2 className="text-center text-xl font-semibold mb-6 text-gray-800">Trip Map</h2>
                {trip ? (
                    <div ref={mapContainer} className="w-full h-96 rounded-lg shadow-inner"></div>
                ) : (
                    <p className="text-center text-gray-500 italic">Select a trip from the list to view its route on the map.</p>
                )}
            </div>
        );
    };

    const TripList = () => {
        return (
            <div className="mt-12 bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-center text-xl font-semibold mb-6 text-gray-800">Your Logged Trips</h2>
                {trips.length > 0 ? (
                    <div className="grid gap-6">
                        {trips.map(trip => (
                            <div
                                key={trip.id}
                                className="bg-gray-50 p-6 rounded-lg shadow-inner cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setSelectedTrip(trip)}
                            >
                                <p className="font-semibold text-lg text-indigo-700">{trip.driverName}</p>
                                <p className="text-sm text-gray-500 mb-2">Trip ID: {trip.id}</p>
                                <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                                    <p><strong>From:</strong> {trip.origin}</p>
                                    <p><strong>To:</strong> {trip.destination}</p>
                                    <p><strong>Date:</strong> {trip.date}</p>
                                    <p><strong>Departure:</strong> {trip.departureTime}</p>
                                    <p><strong>Current Location:</strong> {trip.currentLocation}</p>
                                    <p><strong>Cycle Used:</strong> {trip.cycleUsed} Hrs</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 italic">No trips logged yet.</p>
                )}
            </div>
        );
    };

    const Modal = ({ message, isSuccess, onClose }) => {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm mx-auto">
                    <h3 className={`text-xl font-semibold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {isSuccess ? 'Success!' : 'Error'}
                    </h3>
                    <p className="text-gray-700 mb-6">{message}</p>
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 mt-6 tracking-tight">Fleettrack</h1>
                <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                    <div className="text-center text-lg text-gray-600">
                        <span className="font-semibold text-indigo-600">Logged in as:</span> {userId || 'Authenticating...'}
                    </div>
                </div>
                <TripForm />
                <TripMap trip={selectedTrip} />
                <ELDLog trip={selectedTrip} />
                <TripList />
                <div className="text-center mt-12 text-gray-500 text-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Reach out...</h3>
                    <p className="font-medium">sizwe.ngwenya78@gmail.com</p>
                </div>
            </div>

            {showModal && (
                <Modal
                    message={modalMessage}
                    isSuccess={isSuccess}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default App;
