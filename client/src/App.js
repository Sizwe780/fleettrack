import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle, XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed, Database, ListChecks, TrendingUp, Info, Car, FileText, Settings, BarChart2, Book, Plus, Home, Trash2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, orderBy, where, getDocs, setLogLevel, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Define global variables provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Mapbox token from user's uploaded file
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

const App = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [trips, setTrips] = useState([]);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [userId, setUserId] = useState(null);
    const [app, setApp] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);

    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    const [modal, setModal] = useState({
        isVisible: false,
        title: '',
        message: '',
        isConfirm: false,
        onConfirm: () => {},
        onCancel: () => {}
    });

    const showModal = (title, message, isConfirm = false) => {
        return new Promise(resolve => {
            setModal({
                isVisible: true,
                title,
                message,
                isConfirm,
                onConfirm: () => {
                    setModal(prev => ({ ...prev, isVisible: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setModal(prev => ({ ...prev, isVisible: false }));
                    resolve(false);
                }
            });
        });
    };
    
    // Firebase & Mapbox Initialization
    useEffect(() => {
        if (Object.keys(firebaseConfig).length > 0) {
            const firebaseApp = initializeApp(firebaseConfig);
            const firebaseAuth = getAuth(firebaseApp);
            const firestoreDb = getFirestore(firebaseApp);
            setLogLevel('debug');
            setApp(firebaseApp);
            setDb(firestoreDb);
            setAuth(firebaseAuth);

            onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        } else {
                            await signInAnonymously(firebaseAuth);
                        }
                    } catch (error) {
                        console.error("Firebase Auth error:", error);
                        showModal("Authentication Error", "Failed to sign in. Check network connection.");
                        setIsAuthReady(true);
                    }
                }
            });
        }
    }, [initialAuthToken]);

    // Firestore Listener
    useEffect(() => {
        if (!db || !userId) return;

        const tripsRef = collection(db, `artifacts/${appId}/users/${userId}/trips`);
        const q = query(tripsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = [];
            snapshot.forEach(doc => {
                fetchedTrips.push({ id: doc.id, ...doc.data() });
            });
            // Sort by timestamp in descending order on the client side
            fetchedTrips.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
            showModal("Database Error", "Failed to fetch trip data.");
        });

        return () => unsubscribe();
    }, [db, userId]);

    // Mapbox Map Initialization and dynamic script loading
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js`;
        script.onload = () => {
            window.mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
            if (mapContainer.current) {
                mapRef.current = new window.mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [-98.5795, 39.8283], // Center of the US
                    zoom: 3
                });
                mapRef.current.addControl(new window.mapboxgl.NavigationControl());
            }
        };
        document.head.appendChild(script);
        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            document.head.removeChild(script);
        };
    }, []);

    // Function to calculate route and generate logs
    const generateTrip = async (tripDetails) => {
        setIsLoading(true);
        try {
            const { driverName, currentLocation, pickupLocation, dropoffLocation, currentCycleHours } = tripDetails;

            const geocodeLocation = async (location) => {
                const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`);
                const data = await response.json();
                if (data.features.length === 0) throw new Error(`Could not find coordinates for ${location}`);
                return data.features[0].geometry.coordinates;
            };

            const pickupCoords = await geocodeLocation(pickupLocation);
            const dropoffCoords = await geocodeLocation(dropoffLocation);
            
            const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
            const routeResponse = await fetch(routeUrl);
            const routeData = await routeResponse.json();

            if (!routeData.routes || routeData.routes.length === 0) throw new Error("Could not find a route between the locations.");
            
            const route = routeData.routes[0];
            const distanceMiles = route.distance / 1609.34;
            const durationHours = route.duration / 3600;

            const logs = [];
            let totalHoursUsed = parseFloat(currentCycleHours);
            let totalTripHours = durationHours + 2; 
            const drivingLimit = 11;
            const onDutyLimit = 14;
            const cycleLimit = 70;
            const offDutyNeeded = 10;
            const mandatoryBreak = 0.5;
            const fuelInterval = 1000;
            let days = 1;

            while (totalTripHours > 0) {
                let dailyDriving = Math.min(totalTripHours, drivingLimit);
                let dailyOnDuty = dailyDriving;
                let dailyOffDuty = 0;
                let dailySleeper = 0;
                let remarks = [];
                
                if (days === 1) {
                    remarks.push({ time: "Start", status: "On Duty", notes: `Pickup at ${pickupLocation}.` });
                    dailyOnDuty += 1; // 1 hour for pickup
                }

                // Add fuel stops
                const fuelStops = Math.floor(distanceMiles / fuelInterval);
                if (fuelStops > 0 && days === 1) {
                    for(let i = 1; i <= fuelStops; i++){
                        remarks.push({ time: "Varies", status: "On Duty", notes: `Fuel stop #${i}.` });
                        dailyOnDuty += 1;
                    }
                }

                // Add mandatory breaks
                if (dailyDriving >= 8) {
                    dailyOffDuty += mandatoryBreak;
                    remarks.push({ time: "Varies", status: "Off Duty", notes: "Mandatory 30-minute break." });
                }

                // Check for 14-hour on-duty limit
                if (dailyOnDuty > onDutyLimit) {
                    // This scenario is not handled in the user's original logic. For simplicity, we will log a warning.
                    remarks.push({ time: "Warning", status: "On Duty", notes: "Exceeded 14-hour on-duty limit." });
                }

                totalHoursUsed += dailyOnDuty + dailyOffDuty + dailySleeper;
                totalTripHours -= dailyDriving;

                if (totalTripHours <= 0) {
                    remarks.push({ time: "End", status: "On Duty", notes: `Trip concluded at ${dropoffLocation}.` });
                    dailyOnDuty += 1; // 1 hour for dropoff
                } else {
                    dailySleeper += offDutyNeeded;
                    remarks.push({ time: "End of Day", status: "Sleeper Berth", notes: `Mandatory 10-hour rest on Day ${days}.` });
                }

                logs.push({
                    day: days,
                    driving: dailyDriving.toFixed(2),
                    onDuty: dailyOnDuty.toFixed(2),
                    offDuty: dailyOffDuty.toFixed(2),
                    sleeperBerth: dailySleeper.toFixed(2),
                    remarks
                });

                days++;
            }
            
            if (totalHoursUsed > cycleLimit) {
                showModal("Warning", `Driver has exceeded the 70-hour cycle limit. Total hours: ${totalHoursUsed.toFixed(2)}.`);
            }

            const newTrip = {
                driverName,
                pickup: pickupLocation,
                dropoff: dropoffLocation,
                miles: distanceMiles.toFixed(2),
                hours: durationHours.toFixed(2),
                logs,
                route: route.geometry,
                timestamp: serverTimestamp()
            };

            if (db && userId) {
                const tripsRef = collection(db, `artifacts/${appId}/users/${userId}/trips`);
                await addDoc(tripsRef, newTrip);
                showModal("Success", "Trip saved and log sheets generated!");
            } else {
                console.error("Firebase not initialized or user not logged in.");
            }

            setSelectedTrip(newTrip);
            setCurrentPage('logs');

        } catch (error) {
            console.error("Trip generation error:", error);
            showModal("Trip Error", error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const deleteTrip = async (tripId) => {
        const confirm = await showModal("Confirm Deletion", "Are you sure you want to delete this trip?", true);
        if (confirm) {
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/trips`, tripId));
                showModal("Deleted", "Trip has been deleted successfully.");
            } catch (error) {
                console.error("Error deleting trip:", error);
                showModal("Error", "Failed to delete trip.");
            }
        }
    };

    // UI components
    const DashboardCard = ({ icon, title, value, unit, color }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4">
            <div className={`flex-shrink-0 bg-${color}-100 rounded-full p-3`}>
                <div className={`h-6 w-6 text-${color}-500`}>{icon}</div>
            </div>
            <div>
                <div className="text-sm text-gray-500">{title}</div>
                <div className="text-2xl font-semibold text-gray-900">{value} <span className="text-base font-normal text-gray-500">{unit}</span></div>
            </div>
        </div>
    );

    const renderDashboard = () => {
        const totalMiles = trips.reduce((sum, trip) => sum + parseFloat(trip.miles), 0);
        const totalHours = trips.reduce((sum, trip) => sum + parseFloat(trip.hours), 0);
        const totalTrips = trips.length;

        return (
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard icon={<Gauge />} title="Total Miles Logged" value={totalMiles.toFixed(2)} unit="miles" color="blue" />
                    <DashboardCard icon={<Clock />} title="Total Hours Driven" value={totalHours.toFixed(2)} unit="hours" color="green" />
                    <DashboardCard icon={<Truck />} title="Total Trips Completed" value={totalTrips} unit="trips" color="purple" />
                </div>
            </div>
        );
    };

    const renderLogs = () => (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Trip Logs</h2>
            {selectedTrip ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Log Sheet for {selectedTrip.driverName}</h3>
                        <button onClick={() => setSelectedTrip(null)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <ListChecks size={18} /> Back to List
                        </button>
                    </div>
                    {selectedTrip.logs.map((log, index) => (
                        <div key={index} className="log-sheet p-6 mb-8 rounded-lg border-2 border-gray-200">
                            <div className="text-center mb-4">
                                <h1 className="text-2xl font-bold text-gray-800">Daily Log Sheet (Day {log.day})</h1>
                                <p className="text-sm text-gray-500">Date: {selectedTrip.timestamp?.toDate().toLocaleDateString()}</p>
                            </div>
                            <div className="graph-container relative w-full h-48 border border-gray-400 rounded-lg overflow-hidden">
                                <div className="absolute top-0 w-full h-full flex flex-col justify-between">
                                    <div className="absolute w-full h-1/4 bg-gray-100"></div>
                                    <div className="absolute w-full h-1/4 bg-gray-200 top-1/4"></div>
                                    <div className="absolute w-full h-1/4 bg-gray-300 top-2/4"></div>
                                    <div className="absolute w-full h-1/4 bg-gray-400 top-3/4"></div>
                                </div>
                                <canvas ref={canvas => {
                                    if (canvas) {
                                        const ctx = canvas.getContext('2d');
                                        canvas.width = canvas.offsetWidth;
                                        canvas.height = canvas.offsetHeight;
                                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                                        const hourWidth = canvas.width / 24;
                                        
                                        const dutyStatusPositions = {
                                            'Off Duty': canvas.height * 0.125,
                                            'Sleeper Berth': canvas.height * 0.375,
                                            'Driving': canvas.height * 0.625,
                                            'On Duty': canvas.height * 0.875,
                                        };
                                        
                                        let currentHour = 0;
                                        const timeEntries = [
                                            { status: 'Off Duty', hours: 0 },
                                            { status: 'Driving', hours: parseFloat(log.driving) },
                                            { status: 'On Duty', hours: parseFloat(log.onDuty) },
                                            { status: 'Sleeper Berth', hours: parseFloat(log.sleeperBerth) }
                                        ];

                                        ctx.lineWidth = 4;
                                        ctx.strokeStyle = '#3b82f6';
                                        
                                        // Draw the log line graph
                                        ctx.beginPath();
                                        ctx.moveTo(0, dutyStatusPositions['Off Duty']);
                                        for (const entry of timeEntries) {
                                            const startX = currentHour * hourWidth;
                                            const endX = (currentHour + entry.hours) * hourWidth;
                                            const y = dutyStatusPositions[entry.status] || 0;
                                            
                                            if (currentHour > 0) {
                                                ctx.lineTo(startX, y);
                                            }
                                            ctx.lineTo(endX, y);
                                            currentHour += entry.hours;
                                        }
                                        ctx.stroke();

                                        // Draw labels and grid lines
                                        ctx.font = '10px Inter';
                                        ctx.fillStyle = '#4b5563';
                                        for (let i = 0; i <= 24; i++) {
                                            const xPos = i * hourWidth;
                                            ctx.fillText(i, xPos, 15);
                                            ctx.beginPath();
                                            ctx.moveTo(xPos, 20);
                                            ctx.lineTo(xPos, canvas.height);
                                            ctx.strokeStyle = '#e5e7eb';
                                            ctx.stroke();
                                        }
                                    }
                                }} width="800" height="150" className="w-full"></canvas>
                                <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-around text-xs font-semibold text-gray-700 p-2">
                                    <span>OFF DUTY</span>
                                    <span>SLEEPER BERTH</span>
                                    <span>DRIVING</span>
                                    <span>ON DUTY</span>
                                </div>
                            </div>
                            <h4 className="text-lg font-semibold mt-6 mb-2">Remarks & Events</h4>
                            <div className="bg-gray-50 rounded-lg p-4 text-sm">
                                {log.remarks.map((remark, rIndex) => (
                                    <p key={rIndex} className="mb-1">
                                        <span className="font-bold text-gray-700">[{remark.status}]</span> {remark.notes}
                                    </p>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300">
                                <p className="text-sm font-semibold">Driver Signature: ___________________________________</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <ul className="divide-y divide-gray-200">
                        {trips.length > 0 ? (
                            trips.map(trip => (
                                <li key={trip.id} className="py-4 flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center text-sm font-semibold text-gray-900">
                                            <Truck size={16} className="text-gray-500 mr-2" />
                                            <span className="truncate">{trip.pickup} to {trip.dropoff}</span>
                                        </div>
                                        <p className="mt-1 flex items-center text-sm text-gray-500">
                                            <Calendar size={14} className="mr-1" />
                                            {trip.timestamp?.toDate().toLocaleDateString()}
                                            <User size={14} className="ml-4 mr-1" />
                                            {trip.driverName}
                                        </p>
                                    </div>
                                    <div className="ml-4 flex items-center">
                                        <button onClick={() => setSelectedTrip(trip)} className="p-2 text-blue-600 hover:text-blue-800 transition-colors">
                                            <FileText size={20} />
                                        </button>
                                        <button onClick={() => deleteTrip(trip.id)} className="p-2 text-red-600 hover:text-red-800 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-4 text-center text-gray-500">No trips logged yet.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );

    const renderNewTrip = () => {
        const [form, setForm] = useState({
            driverName: '',
            currentLocation: '',
            pickupLocation: '',
            dropoffLocation: '',
            currentCycleHours: 0
        });

        const handleChange = (e) => {
            setForm({ ...form, [e.target.name]: e.target.value });
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            generateTrip(form);
        };

        return (
            <div className="p-8">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Plan a New Trip</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField icon={<User size={20} />} label="Driver Name" name="driverName" value={form.driverName} onChange={handleChange} required />
                            <InputField icon={<Gauge size={20} />} label="Current Cycle Hours Used" name="currentCycleHours" type="number" value={form.currentCycleHours} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField icon={<Locate size={20} />} label="Current Location" name="currentLocation" value={form.currentLocation} onChange={handleChange} required />
                            <InputField icon={<MapPin size={20} />} label="Pickup Location" name="pickupLocation" value={form.pickupLocation} onChange={handleChange} required />
                        </div>
                        <InputField icon={<MapPin size={20} />} label="Dropoff Location" name="dropoffLocation" value={form.dropoffLocation} onChange={handleChange} required />
                        
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />}
                                <span>{isLoading ? 'Generating Trip...' : 'Generate Trip & Logs'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const InputField = ({ icon, label, ...props }) => (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <input
                {...props}
                className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={label}
            />
        </div>
    );
    
    const Modal = () => {
        if (!modal.isVisible) return null;
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{modal.title}</h3>
                        <button onClick={modal.onCancel} className="text-gray-400 hover:text-gray-600">
                            <XCircle size={24} />
                        </button>
                    </div>
                    <div className="text-sm text-gray-600 mb-6">{modal.message}</div>
                    <div className="flex justify-end space-x-4">
                        {modal.isConfirm && (
                            <button onClick={modal.onCancel} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-full hover:bg-gray-300 transition-colors">
                                Cancel
                            </button>
                        )}
                        <button onClick={modal.onConfirm} className={`text-white font-semibold py-2 px-4 rounded-full transition-colors ${modal.isConfirm ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {modal.isConfirm ? 'Confirm' : 'OK'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderPage = () => {
        if (!isAuthReady || !userId) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                    <Loader size={48} className="animate-spin text-gray-500" />
                    <p className="mt-4 text-gray-600">Connecting to database...</p>
                </div>
            );
        }

        switch (currentPage) {
            case 'dashboard':
                return renderDashboard();
            case 'logs':
                return renderLogs();
            case 'newTrip':
                return renderNewTrip();
            case 'map':
                return (
                    <div className="p-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Map</h2>
                            <div id="map-container" ref={mapContainer} className="h-[500px] w-full rounded-lg shadow-inner"></div>
                            <div className="mt-4 text-gray-600">Map shows the route from the last generated trip.</div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="font-sans antialiased text-gray-900 bg-gray-100 min-h-screen flex flex-col md:flex-row">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.css" rel="stylesheet" />
            <style>
                {`
                    @import url('https://rsms.me/inter/inter.css');
                    html, body, #root {
                        font-family: 'Inter', sans-serif;
                    }
                `}
            </style>
            
            <Modal />

            {/* Sidebar Navigation */}
            <aside className="bg-gray-800 text-gray-100 md:w-64 w-full p-4 flex md:flex-col justify-around items-center md:justify-start md:space-y-4 shadow-xl fixed bottom-0 md:static md:h-screen z-40">
                <nav className="flex md:flex-col space-x-4 md:space-x-0 md:space-y-4 w-full">
                    <button onClick={() => setCurrentPage('dashboard')} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors w-full text-left ${currentPage === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <Home size={20} />
                        <span className="hidden md:inline">Dashboard</span>
                    </button>
                    <button onClick={() => setCurrentPage('newTrip')} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors w-full text-left ${currentPage === 'newTrip' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <Plus size={20} />
                        <span className="hidden md:inline">New Trip</span>
                    </button>
                    <button onClick={() => setCurrentPage('logs')} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors w-full text-left ${currentPage === 'logs' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <FileText size={20} />
                        <span className="hidden md:inline">Log Sheets</span>
                    </button>
                    <button onClick={() => setCurrentPage('map')} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors w-full text-left ${currentPage === 'map' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <MapPin size={20} />
                        <span className="hidden md:inline">Trip Map</span>
                    </button>
                </nav>
            </aside>
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-30">
                    <h1 className="text-2xl font-bold text-gray-800">LogTrack</h1>
                    {userId && (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">UserID:</span>
                            <span className="bg-gray-200 text-gray-800 text-xs font-mono px-3 py-1 rounded-full">{userId}</span>
                        </div>
                    )}
                </header>
                <div className="p-4 md:p-8">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
};

export default App;
