/* global __app_id, __firebase_config, __initial_auth_token, mapboxgl */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, setDoc, getDoc } from 'firebase/firestore';
import { Truck, MapPin, Calendar, Gauge, Info, CheckCircle, XCircle, Locate, Loader, ListChecks, TrendingUp, Fuel, Bed, ClipboardPenLine, User, Home, BookA } from 'lucide-react';
import { createRoot } from 'react-dom/client';

// Main App component
const App = () => {
    // State management for UI and data
    const [activeTab, setActiveTab] = useState('home');
    const [formData, setFormData] = useState({
        pickupLocation: '',
        dropoffLocation: '',
        cycleUsed: ''
    });
    const [profileData, setProfileData] = useState({
        driverName: '',
        vehicleNumber: '',
        homeTerminal: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [locationStatus, setLocationStatus] = useState(null);
    const [tripData, setTripData] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    // State for Firebase
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [profileIsLoading, setProfileIsLoading] = useState(true);

    // Canvas and Mapbox references
    const canvasRef = useRef(null);
    const mapRef = useRef(null);
    const mapbox = useRef(null);
    const mapInstance = useRef(null);
    const currentLocMarker = useRef(null);

    // --- Firebase Initialization and Data Fetching ---
    useEffect(() => {
        const initFirebase = async () => {
            try {
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
                const app = initializeApp(firebaseConfig);
                const authInstance = getAuth(app);
                const dbInstance = getFirestore(app);
                setDb(dbInstance);
                setAuth(authInstance);

                const initialToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                if (initialToken) {
                    await signInWithCustomToken(authInstance, initialToken);
                } else {
                    await signInAnonymously(authInstance);
                }

                const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                    if (user) {
                        setUserId(user.uid);
                    } else {
                        setUserId(null);
                    }
                });
                return () => unsubscribe();
            } catch (error) {
                console.error("Firebase initialization failed:", error);
            }
        };
        initFirebase();
    }, []);

    // Fetch trip data from Firestore
    useEffect(() => {
        if (!db || !userId) return;
        const tripsCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/trips`);
        const unsubscribe = onSnapshot(tripsCollectionRef, (snapshot) => {
            const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort client-side to avoid Firestore index issues
            trips.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
            setTripData(trips);
        }, (error) => {
            console.error("Error listening to trip data:", error);
        });
        return () => unsubscribe();
    }, [db, userId]);

    // Fetch profile data from Firestore
    useEffect(() => {
        if (!db || !userId) return;
        const fetchProfile = async () => {
            setProfileIsLoading(true);
            try {
                const profileDocRef = doc(db, `artifacts/${__app_id}/users/${userId}/profile/userProfile`);
                const profileDoc = await getDoc(profileDocRef);
                if (profileDoc.exists()) {
                    setProfileData(profileDoc.data());
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setProfileIsLoading(false);
            }
        };
        fetchProfile();
    }, [db, userId]);

    // --- Mapbox Initialization and Route Drawing ---
    useEffect(() => {
        if (activeTab === 'home' && mapRef.current && !mapInstance.current) {
            if (!window.mapboxgl) {
                setMessage('Mapbox GL JS is not loaded. Please ensure the script tag is in your HTML.');
                setMessageType('error');
                return;
            }
            mapbox.current = window.mapboxgl;
            mapbox.current.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_Qh_W4LpT9a6aA9V9i5Q'; // Public demo key
            const map = new mapbox.current.Map({
                container: mapRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-98.5795, 39.8283], // Center of the US
                zoom: 3
            });
            mapInstance.current = map;
            map.addControl(new mapbox.current.NavigationControl(), 'bottom-right');
            map.addControl(new mapbox.current.FullscreenControl(), 'bottom-right');

            return () => {
                if (mapInstance.current) {
                    mapInstance.current.remove();
                    mapInstance.current = null;
                }
            };
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'home' && mapInstance.current && selectedTrip && selectedTrip.route) {
            const map = mapInstance.current;
            const geojson = selectedTrip.route;
            const routeSourceId = 'route';

            if (map.getSource(routeSourceId)) {
                map.getSource(routeSourceId).setData(geojson);
            } else {
                map.addSource(routeSourceId, {
                    type: 'geojson',
                    data: geojson
                });
                map.addLayer({
                    id: routeSourceId,
                    type: 'line',
                    source: routeSourceId,
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#3b82f6', 'line-width': 8 }
                });
            }

            // Fit map to route bounds
            const coordinates = geojson.coordinates;
            const bounds = coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord);
            }, new mapbox.current.LngLatBounds(coordinates[0], coordinates[0]));
            map.fitBounds(bounds, { padding: 100 });
        }
    }, [selectedTrip, activeTab]);

    // --- Geolocation Functionality ---
    const handleLocateMe = useCallback(() => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
                    fetch(geocodeUrl)
                        .then(res => res.json())
                        .then(data => {
                            const address = data.address;
                            const city = address.city || address.town || address.village;
                            const state = address.state;
                            const locationStr = city && state ? `${city}, ${state}` : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                            setFormData(prev => ({ ...prev, pickupLocation: locationStr }));
                            setLocationStatus('success');
                            if (currentLocMarker.current) {
                                currentLocMarker.current.remove();
                            }
                            currentLocMarker.current = new mapbox.current.Marker({ color: '#f59e0b' })
                                .setLngLat([longitude, latitude])
                                .addTo(mapInstance.current);
                        })
                        .catch(err => {
                            console.error('Geocoding error:', err);
                            setMessage('Failed to get city/state. Using coordinates.');
                            setMessageType('error');
                            setFormData(prev => ({ ...prev, pickupLocation: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                        })
                        .finally(() => setIsLocating(false));
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationStatus('error');
                    setMessage('Unable to retrieve location.');
                    setMessageType('error');
                    setIsLocating(false);
                }
            );
        } else {
            setLocationStatus('error');
            setMessage('Geolocation is not supported by your browser.');
            setMessageType('error');
            setIsLocating(false);
        }
    }, []);

    // --- Trip Planning Logic ---
    const calculateTripSchedule = (totalDrivingHours, cycleUsed) => {
        const schedule = [];
        let remainingHours = totalDrivingHours;
        let remainingCycle = 70 - parseFloat(cycleUsed);
        let days = 1;

        while (remainingHours > 0) {
            const daySchedule = { offDuty: 0, sleeper: 0, driving: 0, onDuty: 0 };
            const maxDrivingToday = Math.min(11, remainingHours, remainingCycle);
            
            daySchedule.driving = maxDrivingToday;
            remainingHours -= daySchedule.driving;
            remainingCycle -= daySchedule.driving;

            let onDutyTime = 0;
            // Add 1 hour for pre-trip/post-trip
            onDutyTime += 1;
            // 30 minute break after 8 hours of driving
            if (daySchedule.driving >= 8) {
                onDutyTime += 0.5;
            }
            
            daySchedule.onDuty = onDutyTime;
            
            // Re-adjust driving if we exceed 14 hours on duty
            if (daySchedule.driving + daySchedule.onDuty > 14) {
                const excess = (daySchedule.driving + daySchedule.onDuty) - 14;
                daySchedule.driving -= excess;
                remainingHours += excess;
            }
            
            // All remaining time is Off Duty (or sleeper berth, but we'll simplify)
            daySchedule.offDuty = 24 - (daySchedule.driving + daySchedule.onDuty);

            schedule.push(daySchedule);
            days++;
            
            // Check for 34 hour restart or 8-day cycle reset
            // This is a simplified model. A real one would track previous 8 days.
            if ((days - 1) % 8 === 0) {
                 remainingCycle = 70;
            }
        }
        return schedule;
    };

    const handlePlanTrip = async (e) => {
        e.preventDefault();
        if (!db || !userId) {
            setMessage("Authentication is not ready. Please wait.");
            setMessageType('error');
            return;
        }
        if (!profileData.driverName || !profileData.vehicleNumber) {
            setMessage("Please fill out your driver profile first.");
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('Calculating route...');
        setMessageType('info');

        try {
            // Geocoding for pickup and dropoff
            const pickupGeo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.pickupLocation)}&format=json&limit=1`).then(res => res.json());
            const dropoffGeo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.dropoffLocation)}&format=json&limit=1`).then(res => res.json());

            if (pickupGeo.length === 0 || dropoffGeo.length === 0) {
                setMessage("Could not find locations. Please be more specific.");
                setMessageType('error');
                setIsLoading(false);
                return;
            }

            const startCoords = [parseFloat(pickupGeo[0].lon), parseFloat(pickupGeo[0].lat)];
            const endCoords = [parseFloat(dropoffGeo[0].lon), parseFloat(dropoffGeo[0].lat)];

            // OSRM routing API call
            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${startCoords.join(',')};${endCoords.join(',')}?geometries=geojson&steps=true`;
            setMessage('Getting routing instructions...');
            const routeRes = await fetch(osrmUrl).then(res => res.json());

            if (routeRes.code !== 'Ok' || !routeRes.routes[0]) {
                setMessage("Could not find a valid route. Please check your locations.");
                setMessageType('error');
                setIsLoading(false);
                return;
            }

            const route = routeRes.routes[0];
            const distanceMeters = route.distance;
            const durationSeconds = route.duration;

            const distanceMiles = (distanceMeters * 0.000621371).toFixed(2);
            const totalDrivingHours = (durationSeconds / 3600).toFixed(2);

            const totalHours = parseFloat(totalDrivingHours);
            const schedule = calculateTripSchedule(totalHours, formData.cycleUsed);

            const newTrip = {
                ...formData,
                distanceMiles: distanceMiles,
                totalDrivingHours: totalDrivingHours,
                totalHours: totalHours.toFixed(2),
                logSchedule: schedule,
                route: route.geometry,
                profile: profileData,
                createdAt: new Date()
            };

            await addDoc(collection(db, `artifacts/${__app_id}/users/${userId}/trips`), newTrip);
            setSelectedTrip(newTrip);
            setMessage('Trip planned and saved successfully!');
            setMessageType('success');
            setIsLoading(false);
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            setMessageType('error');
            console.error("Error during trip planning:", error);
            setIsLoading(false);
        }
    };

    // --- Profile Saving Logic ---
    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!db || !userId) {
            setMessage("Authentication is not ready. Please wait.");
            setMessageType('error');
            return;
        }
        setIsLoading(true);
        try {
            const profileDocRef = doc(db, `artifacts/${__app_id}/users/${userId}/profile/userProfile`);
            await setDoc(profileDocRef, profileData);
            setMessage("Profile saved successfully!");
            setMessageType('success');
        } catch (error) {
            setMessage("Failed to save profile. Please try again.");
            setMessageType('error');
            console.error("Error saving profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- ELD Log Canvas Drawing ---
    const drawEldLog = useCallback((trip, dayIndex) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const schedule = trip.logSchedule[dayIndex];
        if (!schedule) return;

        const margin = 20;
        const logHeight = canvas.height - 2 * margin;
        const logWidth = canvas.width - 2 * margin;
        const hourMarkerInterval = logWidth / 24;
        const statusHeight = logHeight / 4;

        // Draw header
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = '#1f2937';
        ctx.textAlign = 'left';
        ctx.fillText(`Driver: ${trip.profile?.driverName || 'N/A'}`, margin, 20);
        ctx.fillText(`Vehicle: ${trip.profile?.vehicleNumber || 'N/A'}`, margin, 40);
        ctx.fillText(`Home Terminal: ${trip.profile?.homeTerminal || 'N/A'}`, margin, 60);
        ctx.fillText(`Log Date: Day ${dayIndex + 1}`, margin + 200, 20);

        // Draw hour markers
        ctx.fillStyle = '#555';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 24; i++) {
            const x = margin + i * hourMarkerInterval;
            ctx.moveTo(x, margin + 80);
            ctx.lineTo(x, canvas.height - margin);
            ctx.fillText(i, x, margin + 70);
        }

        // Draw status lines
        const statuses = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty'];
        ctx.textAlign = 'left';
        ctx.font = '12px Inter, sans-serif';
        statuses.forEach((status, index) => {
            const y = margin + 80 + index * statusHeight;
            ctx.fillText(status, margin + 5, y + statusHeight / 2 + 5);
        });

        // Draw log line
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3b82f6';
        let currentTime = 0;

        // Draw Off Duty
        ctx.moveTo(margin + (currentTime * hourMarkerInterval), margin + 80 + 0.5 * statusHeight);
        currentTime += schedule.offDuty || 0;
        ctx.lineTo(margin + (currentTime * hourMarkerInterval), margin + 80 + 0.5 * statusHeight);

        // Draw Sleeper Berth
        ctx.lineTo(margin + (currentTime * hourMarkerInterval), margin + 80 + 1.5 * statusHeight);
        currentTime += schedule.sleeper || 0;
        ctx.lineTo(margin + (currentTime * hourMarkerInterval), margin + 80 + 1.5 * statusHeight);
        
        // Draw Driving
        ctx.lineTo(margin + (currentTime * hourMarkerInterval), margin + 80 + 2.5 * statusHeight);
        currentTime += schedule.driving || 0;
        ctx.lineTo(margin + (currentTime * hourMarkerInterval), margin + 80 + 2.5 * statusHeight);
        
        // Draw On Duty
        ctx.lineTo(margin + (currentTime * hourMarkerInterval), margin + 80 + 3.5 * statusHeight);
        currentTime += schedule.onDuty || 0;
        ctx.lineTo(margin + (currentTime * hourMarkerInterval), margin + 80 + 3.5 * statusHeight);

        ctx.stroke();
    }, []);

    useEffect(() => {
        if (activeTab === 'logs' && selectedTrip) {
            drawEldLog(selectedTrip, currentPage);
        }
    }, [activeTab, selectedTrip, currentPage, drawEldLog]);

    // --- UI Rendering ---
    const renderPage = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="flex flex-col lg:flex-row lg:space-x-6">
                        <div className="lg:w-1/3 mb-6 lg:mb-0 p-4 bg-gray-50 rounded-lg border shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <ClipboardPenLine className="w-5 h-5 text-indigo-600" />
                                <span>Plan Your Trip</span>
                            </h2>
                            <form onSubmit={handlePlanTrip} className="space-y-4">
                                <div>
                                    <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700">Pickup Location</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            id="pickupLocation"
                                            name="pickupLocation"
                                            value={formData.pickupLocation}
                                            onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                                            placeholder="E.g., Dallas, TX"
                                            required
                                            className="flex-1 block w-full rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleLocateMe}
                                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                            disabled={isLocating}
                                        >
                                            {isLocating ? <Loader className="animate-spin h-5 w-5" /> : <Locate className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {locationStatus === 'success' && <p className="text-xs text-green-600 mt-1">Location found!</p>}
                                    {locationStatus === 'error' && <p className="text-xs text-red-600 mt-1">Failed to find location.</p>}
                                </div>
                                <div>
                                    <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700">Dropoff Location</label>
                                    <input
                                        type="text"
                                        id="dropoffLocation"
                                        name="dropoffLocation"
                                        value={formData.dropoffLocation}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                                        placeholder="E.g., Miami, FL"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cycleUsed" className="block text-sm font-medium text-gray-700">Current Cycle Used (Hrs)</label>
                                    <input
                                        type="number"
                                        id="cycleUsed"
                                        name="cycleUsed"
                                        value={formData.cycleUsed}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cycleUsed: e.target.value }))}
                                        placeholder="E.g., 20"
                                        min="0"
                                        step="0.1"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                            Planning...
                                        </>
                                    ) : 'Plan Trip'}
                                </button>
                            </form>
                        </div>
                        <div className="lg:w-2/3 p-4 bg-gray-50 rounded-lg border shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-indigo-600" />
                                <span>Route & Schedule</span>
                            </h2>
                            <div ref={mapRef} id="map" className="h-96 rounded-lg mb-4 bg-gray-200"></div>
                            {selectedTrip && (
                                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Trip Summary</h3>
                                    <ul className="space-y-1 text-sm text-gray-700">
                                        <li className="flex justify-between items-center"><span className="font-medium">Total Distance:</span> <span>{selectedTrip.distanceMiles} miles</span></li>
                                        <li className="flex justify-between items-center"><span className="font-medium">Total Driving Time:</span> <span>{selectedTrip.totalDrivingHours} hours</span></li>
                                        <li className="flex justify-between items-center"><span className="font-medium">Planned On-Duty Time:</span> <span>{selectedTrip.totalHours} hours</span></li>
                                        <li className="flex justify-between items-center"><span className="font-medium">Log Sheets Required:</span> <span>{selectedTrip.logSchedule.length}</span></li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="flex flex-col lg:flex-row lg:space-x-6">
                        <div className="w-full p-4 bg-gray-50 rounded-lg border shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                <span>Driver Profile</span>
                            </h2>
                            {profileIsLoading ? (
                                <div className="flex items-center justify-center p-8 text-gray-500">
                                    <Loader className="animate-spin h-6 w-6 mr-3" />
                                    Loading profile...
                                </div>
                            ) : (
                                <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg mx-auto">
                                    <div>
                                        <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">Driver Name</label>
                                        <input
                                            type="text"
                                            id="driverName"
                                            name="driverName"
                                            value={profileData.driverName}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, driverName: e.target.value }))}
                                            placeholder="Your Name"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                                        <input
                                            type="text"
                                            id="vehicleNumber"
                                            name="vehicleNumber"
                                            value={profileData.vehicleNumber}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                                            placeholder="Truck ID or License Plate"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="homeTerminal" className="block text-sm font-medium text-gray-700">Home Terminal Address</label>
                                        <input
                                            type="text"
                                            id="homeTerminal"
                                            name="homeTerminal"
                                            value={profileData.homeTerminal}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, homeTerminal: e.target.value }))}
                                            placeholder="E.g., 123 Trucking Lane, Dallas, TX"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                                Saving...
                                            </>
                                        ) : 'Save Profile'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                );
            case 'logs':
                return (
                    <div className="flex flex-col lg:flex-row lg:space-x-6">
                        <div className="lg:w-1/3 mb-6 lg:mb-0 p-4 bg-gray-50 rounded-lg border shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <ListChecks className="w-5 h-5 text-indigo-600" />
                                <span>Planned Trips</span>
                            </h2>
                            {tripData.length === 0 ? (
                                <p className="text-gray-500 text-sm">No trips planned yet. Go to the "Plan Trip" tab to get started!</p>
                            ) : (
                                <ul className="space-y-2 max-h-96 overflow-y-auto">
                                    {tripData.map(trip => (
                                        <li
                                            key={trip.id}
                                            onClick={() => { setSelectedTrip(trip); setCurrentPage(0); }}
                                            className={`cursor-pointer p-3 rounded-lg border transition-colors duration-200 ${selectedTrip?.id === trip.id ? 'bg-indigo-100 border-indigo-500 shadow-md' : 'bg-white hover:bg-gray-100'}`}
                                        >
                                            <div className="text-sm font-semibold text-gray-900">{trip.pickupLocation} to {trip.dropoffLocation}</div>
                                            <div className="text-xs text-gray-500">
                                                <span>Planned: {new Date(trip.createdAt.seconds * 1000).toLocaleDateString()}</span>
                                                <span className="ml-2">({trip.distanceMiles} mi)</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="lg:w-2/3 p-4 bg-gray-50 rounded-lg border shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <BookA className="w-5 h-5 text-indigo-600" />
                                <span>ELD Log Sheet</span>
                            </h2>
                            {selectedTrip ? (
                                <div>
                                    <div className="mb-4 text-center">
                                        <p className="text-lg font-semibold text-gray-800">Log Sheet for Day {currentPage + 1}</p>
                                        <p className="text-sm text-gray-600">Trip from <span className="text-indigo-600">{selectedTrip.pickupLocation}</span> to <span className="text-indigo-600">{selectedTrip.dropoffLocation}</span></p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <canvas ref={canvasRef} width="1000" height="300" className="bg-white border rounded-lg shadow-sm"></canvas>
                                    </div>
                                    <div className="flex justify-center mt-4 space-x-4">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                            disabled={currentPage === 0}
                                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium disabled:opacity-50"
                                        >Previous Day</button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(selectedTrip.logSchedule.length - 1, prev + 1))}
                                            disabled={currentPage === selectedTrip.logSchedule.length - 1}
                                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium disabled:opacity-50"
                                        >Next Day</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8 text-gray-500">
                                    Select a trip from the list to view its ELD log.
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'reports':
                return (
                    <div className="flex flex-col lg:flex-row lg:space-x-6">
                        <div className="w-full p-4 bg-gray-50 rounded-lg border shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                <span>Trip Reports</span>
                            </h2>
                            {tripData.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center">No trip data available to generate reports.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Origin</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Destination</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Distance (mi)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Driving (hrs)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Log Sheets</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {tripData.map(trip => (
                                                <tr key={trip.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.pickupLocation}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.dropoffLocation}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.distanceMiles}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.totalDrivingHours}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.logSchedule.length}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-inter text-gray-800 p-4 antialiased">
            <style>
                {`
                body { font-family: 'Inter', sans-serif; }
                #map { min-height: 400px; }
                .antialiased { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                `}
            </style>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js"></script>
            <link href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center space-x-2">
                    <Truck className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-3xl font-bold text-gray-900">FleetTrack</h1>
                </div>
                {userId && (
                    <div className="mt-2 sm:mt-0 flex items-center space-x-2 text-sm text-gray-600">
                        <span>User ID: <span className="font-mono text-gray-700 break-all">{userId}</span></span>
                    </div>
                )}
            </header>

            <nav className="mb-6 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
                <ul className="flex justify-around sm:justify-start sm:space-x-4">
                    <li>
                        <button
                            onClick={() => setActiveTab('home')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'}`}
                        >
                            <MapPin className="h-5 w-5" />
                            <span className="font-medium">Plan Trip</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'}`}
                        >
                            <ListChecks className="h-5 w-5" />
                            <span className="font-medium">ELD Logs</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'}`}
                        >
                            <TrendingUp className="h-5 w-5" />
                            <span className="font-medium">Reports</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'}`}
                        >
                            <User className="h-5 w-5" />
                            <span className="font-medium">Profile</span>
                        </button>
                    </li>
                </ul>
            </nav>

            <main className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                {message && (
                    <div className={`flex items-center p-4 mb-4 rounded-lg text-white font-medium ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {messageType === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
                        {message}
                    </div>
                )}
                {renderPage()}
            </main>
        </div>
    );
};

export default App;
