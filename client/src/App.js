import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle, XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed, Database, ListChecks, TrendingUp, Info, Car, FileText, Settings, BarChart2, Book, Plus, Home } from 'lucide-react';
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

    // Custom Modal State
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
                        setIsAuthReady(true); // Still set to true to avoid infinite loading
                    }
                }
            });
        }
    }, [initialAuthToken]);

    // Firestore Listener
    useEffect(() => {
        if (!db || !userId) return;

        const tripsRef = collection(db, `artifacts/${appId}/users/${userId}/trips`);
        const q = query(tripsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = [];
            snapshot.forEach(doc => {
                fetchedTrips.push({ id: doc.id, ...doc.data() });
            });
            setTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
            showModal("Database Error", "Failed to fetch trip data.");
        });

        return () => unsubscribe();
    }, [db, userId]);

    // Mapbox Map Initialization
    useEffect(() => {
        if (mapContainer.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-98.5795, 39.8283], // Center of the US
                zoom: 3
            });
            mapRef.current.addControl(new mapboxgl.NavigationControl());
        }
    }, []);

    // Function to calculate route and generate logs
    const generateTrip = async (tripDetails) => {
        setIsLoading(true);
        try {
            const { driverName, currentLocation, pickupLocation, dropoffLocation, currentCycleHours } = tripDetails;

            // Geocode locations
            const geocodeLocation = async (location) => {
                const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`);
                const data = await response.json();
                if (data.features.length === 0) throw new Error(`Could not find coordinates for ${location}`);
                return data.features[0].geometry.coordinates;
            };

            const pickupCoords = await geocodeLocation(pickupLocation);
            const dropoffCoords = await geocodeLocation(dropoffLocation);
            
            // Get route from Mapbox Directions API
            const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
            const routeResponse = await fetch(routeUrl);
            const routeData = await routeResponse.json();

            if (!routeData.routes || routeData.routes.length === 0) throw new Error("Could not find a route between the locations.");
            
            const route = routeData.routes[0];
            const distanceMiles = route.distance / 1609.34;
            const durationHours = route.duration / 3600;

            const logs = [];
            let totalHoursUsed = parseFloat(currentCycleHours);
            let totalTripHours = durationHours + 2; // 1 hour for pickup, 1 for drop-off
            const drivingLimit = 11;
            const onDutyLimit = 14;
            const cycleLimit = 70;
            const offDutyNeeded = 10;
            const mandatoryBreak = 0.5;
            const fuelInterval = 1000;
            let days = 1;
            let currentDayDriving = 0;
            let currentDayOnDuty = 0;
            let currentDayOffDuty = 0;
            let currentDaySleeper = 0;
            const remarks = [];
            
            // Add initial pickup remark
            remarks.push({ time: "Start", status: "On Duty", notes: `Pickup at ${pickupLocation}.` });

            // Simulate the trip day by day
            while (totalTripHours > 0) {
                const todayDriving = Math.min(totalTripHours, drivingLimit - currentDayDriving);
                currentDayDriving += todayDriving;
                totalHoursUsed += todayDriving;
                totalTripHours -= todayDriving;
                remarks.push({ time: "Varies", status: "Driving", notes: `Driving on Day ${days}.` });
                
                // Add fuel stops
                const fuelStops = Math.floor(distanceMiles / fuelInterval);
                if (fuelStops > 0) {
                     for(let i = 1; i <= fuelStops; i++){
                        remarks.push({ time: "Varies", status: "On Duty", notes: `Fuel stop #${i}.` });
                     }
                }

                // Add mandatory breaks
                if (currentDayDriving >= 8) {
                    currentDayOffDuty += mandatoryBreak;
                    totalHoursUsed += mandatoryBreak;
                    remarks.push({ time: "Varies", status: "Off Duty", notes: "Mandatory 30-minute break." });
                }

                // If trip continues, add off-duty time for the night
                if (totalTripHours > 0) {
                    currentDaySleeper += offDutyNeeded;
                    totalHoursUsed += offDutyNeeded;
                    remarks.push({ time: "End of Day", status: "Sleeper Berth", notes: `Mandatory 10-hour rest on Day ${days}.` });
                } else {
                    // Final drop-off remark
                    remarks.push({ time: "End", status: "On Duty", notes: `Trip concluded at ${dropoffLocation}.` });
                }

                // Calculate total duty hours for the day
                currentDayOnDuty = currentDayDriving + (remarks.filter(r => r.status === 'On Duty').length * 1); // 1 hour for each on duty stop

                logs.push({
                    day: days,
                    driving: currentDayDriving.toFixed(2),
                    onDuty: currentDayOnDuty.toFixed(2),
                    offDuty: currentDayOffDuty.toFixed(2),
                    sleeperBerth: currentDaySleeper.toFixed(2),
                    remarks
                });

                if (totalHoursUsed > cycleLimit) {
                    showModal("Warning", `Driver has exceeded the 70-hour cycle limit. Total hours: ${totalHoursUsed.toFixed(2)}.`);
                }
                
                // Reset for next day
                days++;
                currentDayDriving = 0;
                currentDayOnDuty = 0;
                currentDayOffDuty = 0;
                currentDaySleeper = 0;
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

            // Save to Firestore
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
    
    // UI components
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
                                <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
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
                                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                                        const hourWidth = canvas.width / 24;
                                        
                                        const dutyStatusPositions = {
                                            'Driving': canvas.height * 0.375,
                                            'On Duty': canvas.height * 0.625,
                                            'Off Duty': canvas.height * 0.125,
                                            'Sleeper Berth': canvas.height * 0.875
                                        };
                                        
                                        let currentHour = 0;
                                        const timeEntries = [];
                                        
                                        timeEntries.push({ status: 'Off Duty', hours: 0 });
                                        timeEntries.push({ status: 'Driving', hours: parseFloat(log.driving) });
                                        timeEntries.push({ status: 'On Duty', hours: parseFloat(log.onDuty) });
                                        timeEntries.push({ status: 'Sleeper Berth', hours: parseFloat(log.sleeperBerth) });

                                        ctx.lineWidth = 4;
                                        ctx.strokeStyle = '#3b82f6';

                                        for (const entry of timeEntries) {
                                            const startX = currentHour * hourWidth;
                                            const endX = (currentHour + entry.hours) * hourWidth;
                                            const y = dutyStatusPositions[entry.status] || 0;
                                            
                                            ctx.beginPath();
                                            ctx.moveTo(startX, y);
                                            ctx.lineTo(endX, y);
                                            ctx.stroke();
                                            currentHour += entry.hours;
                                        }

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
                    <button onClick={() => window.print()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-lg transition duration-300">
                        <Printer size={18} className="inline mr-2" /> Print Log Sheet
                    </button>
                </div>
            ) : (
                trips.length > 0 ? (
                    <div className="space-y-4">
                        {trips.map(trip => (
                            <div key={trip.id} onClick={() => setSelectedTrip(trip)} className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center cursor-pointer transition duration-200 hover:shadow-xl">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{trip.pickup} to {trip.dropoff}</h3>
                                    <p className="text-sm text-gray-500">Trip completed on {new Date(trip.timestamp.seconds * 1000).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-700">{trip.miles} mi</p>
                                    <p className="text-sm text-gray-500">{trip.hours} hrs</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
                        <p>No trips logged yet. Start a new trip to see your history.</p>
                    </div>
                )
            )}
        </div>
    );
    
    const renderAddTrip = () => (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Plan a New Trip</h2>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">Driver Name</label>
                        <input type="text" id="driverName" name="driverName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="currentCycleHours" className="block text-sm font-medium text-gray-700">Current Cycle Used (Hrs)</label>
                        <input type="number" id="currentCycleHours" name="currentCycleHours" step="any" min="0" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700">Pickup Location</label>
                        <input type="text" id="pickupLocation" name="pickupLocation" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700">Drop-off Location</label>
                        <input type="text" id="dropoffLocation" name="dropoffLocation" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {isLoading ? (
                            <Loader size={20} className="animate-spin" />
                        ) : (
                            <>
                                <Plus size={20} className="mr-2" />
                                Generate Trip
                            </>
                        )}
                    </button>
                </form>
            </div>
            {isLoading && (
                <div className="mt-8 text-center text-gray-500">
                    <p>Generating trip and logs. This may take a moment...</p>
                </div>
            )}
        </div>
    );
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const tripDetails = {
            driverName: formData.get('driverName'),
            currentLocation: '', // Can be added later with geolocation
            pickupLocation: formData.get('pickupLocation'),
            dropoffLocation: formData.get('dropoffLocation'),
            currentCycleHours: formData.get('currentCycleHours')
        };
        generateTrip(tripDetails);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.js"></script>
            <link href="https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.css" rel="stylesheet" />
            <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
            <style>{`
                html, body { font-family: 'Inter', sans-serif; }
                .log-sheet { page-break-after: always; }
                @media print {
                    body * { visibility: hidden; }
                    .log-sheet, .log-sheet * { visibility: visible; }
                    .log-sheet { position: absolute; left: 0; top: 0; }
                }
            `}</style>
            
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center text-xl font-bold text-gray-800">
                                <Truck className="h-8 w-8 text-blue-600 mr-2" />
                                FleetTrack
                            </div>
                        </div>
                        <div className="flex items-center">
                            <NavItem icon={<BarChart2 />} label="Dashboard" onClick={() => setCurrentPage('dashboard')} active={currentPage === 'dashboard'} />
                            <NavItem icon={<ListChecks />} label="Logs" onClick={() => { setCurrentPage('logs'); setSelectedTrip(null); }} active={currentPage === 'logs'} />
                            <NavItem icon={<Plus />} label="New Trip" onClick={() => setCurrentPage('add-trip')} active={currentPage === 'add-trip'} />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {currentPage === 'dashboard' && renderDashboard()}
                {currentPage === 'logs' && renderLogs()}
                {currentPage === 'add-trip' && renderAddTrip()}
            </main>

            <footer className="bg-gray-200 text-gray-600 text-xs p-4 text-center">
                <p>App ID: {appId} | User ID: {userId}</p>
            </footer>

            {/* Custom Modal */}
            {modal.isVisible && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">{modal.title}</h3>
                        <p className="text-gray-700 mb-6">{modal.message}</p>
                        <div className="flex justify-end gap-3">
                            {modal.isConfirm && (
                                <button onClick={modal.onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">
                                    Cancel
                                </button>
                            )}
                            <button onClick={modal.onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const NavItem = ({ icon, label, onClick, active }) => (
    <button onClick={onClick} className={`ml-4 flex items-center px-3 py-2 rounded-md text-sm font-medium ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
        {icon && React.cloneElement(icon, { size: 20, className: "mr-1" })}
        {label}
    </button>
);

export default App;
