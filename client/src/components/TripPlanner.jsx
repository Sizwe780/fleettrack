import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection } from 'firebase/firestore';

// Global variables provided by the environment
const __app_id = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const __firebase_config = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const __initial_auth_token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Firebase Initialization
let db, auth;
try {
    const firebaseApp = initializeApp(__firebase_config);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    console.log("Firebase initialized successfully.");
} catch (e) {
    console.error("Error initializing Firebase:", e);
    if (e.code === 'auth/invalid-api-key') {
        console.error("A Firebase configuration error has occurred: The provided API key is invalid. Please check your '__firebase_config' variable to ensure the 'apiKey' is correct.");
    }
}

// FAKE BACKEND function (corrected for Firestore)
const FAKE_BACKEND_tripAnalysis = async (form, userId) => {
    const { destination, cycleUsed, driver_name, date, departureTime } = form;
    
    // Simulating a network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const distanceMiles = 715;
    const durationHours = 12.5;

    // ✅ FIX: `dailyLogs` is now a flat array of objects to avoid the Firestore nested array error.
    const logs = [
        { day: 1, status: 'On Duty', duration: 1 },
        { day: 1, status: 'Driving', duration: 5.5 },
        { day: 1, status: 'Off Duty', duration: 0.5 },
        { day: 1, status: 'Driving', duration: 5.5 },
        { day: 1, status: 'On Duty', duration: 1 },
        { day: 1, status: 'Off Duty', duration: 10 },
    ];

    const scoreTrip = () => {
        const healthScore = (durationHours > 10) ? 80 : 100;
        return healthScore;
    };

    return {
        origin: form.origin,
        destination: form.destination,
        cycleUsed: form.cycleUsed,
        driver_name: form.driver_name,
        date: form.date,
        departureTime: form.departureTime,
        routeData: {
            distance: distanceMiles,
            duration: durationHours,
        },
        analysis: {
            profitability: {
                inputs: { ratePerMile: 3.50, fuelMpg: 6.5, fuelPrice: 3.89 },
                distanceMiles,
                otherCosts: 125,
            },
            ifta: {
                estimatedTax: '$95.20',
                milesByState: [{ state: 'Eastern Cape', miles: 250 }, { state: 'Western Cape', miles: 465 }],
            },
            remarks: [
                `Trip is ~${distanceMiles.toFixed(0)} miles and will require ${durationHours.toFixed(1)} hours of driving.`,
                `Day 1: Max 11 hours driving within a 14-hour on-duty window.`,
                `A 30-minute break is mandatory after 8 cumulative hours of driving.`,
                `A 10-hour off-duty break is required at the end of the day.`,
                `Fleet Health Score: ${scoreTrip()} / 100`,
            ],
            dailyLogs: logs,
        }
    };
};

// Your original TripPlanner component
const TripPlanner = ({ userId, onTripCreated }) => {
    const [form, setForm] = useState({
        origin: 'Gqeberha, EC',
        destination: 'Cape Town, WC',
        cycleUsed: '25',
        driver_name: 'Sizwe Ngwenya',
        date: new Date().toISOString().split('T')[0],
        departureTime: '08:00',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const newTripData = await FAKE_BACKEND_tripAnalysis(form, userId);

            const safeTripData = {
                origin: newTripData.origin,
                destination: newTripData.destination,
                cycleUsed: newTripData.cycleUsed,
                driver_name: newTripData.driver_name,
                date: newTripData.date,
                departureTime: newTripData.departureTime,
                routeData: newTripData.routeData,
                analysis: {
                    profitability: newTripData.analysis?.profitability ?? null,
                    ifta: newTripData.analysis?.ifta ?? null,
                    remarks: newTripData.analysis?.remarks ?? '',
                    dailyLogs: JSON.stringify(newTripData.analysis?.dailyLogs ?? []),
                },
            };

            const tripsPath = `apps/fleet-track-app/users/${userId}/trips`;
            const docRef = await addDoc(collection(db, tripsPath), safeTripData);
            
            onTripCreated({ id: docRef.id, ...safeTripData });

            setForm({
                origin: '',
                destination: '',
                cycleUsed: '',
                driver_name: '',
                date: '',
                departureTime: '',
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const Input = ({ label, name, value, type = 'text' }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                name={name}
                value={value}
                type={type}
                onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );

    return (
        <div className="max-w-xl mx-auto p-6 bg-gray-100 rounded-xl shadow-lg mt-10">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Plan a New Trip</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Origin" name="origin" value={form.origin} />
                    <Input label="Destination" name="destination" value={form.destination} />
                    <Input label="Cycle Used (hrs)" name="cycleUsed" value={form.cycleUsed} type="number" />
                    <Input label="Driver Name" name="driver_name" value={form.driver_name} />
                    <Input label="Trip Date" name="date" value={form.date} type="date" />
                    <Input label="Departure Time" name="departureTime" value={form.departureTime} type="time" />
                </div>
                <button type="submit" disabled={isLoading} className={`w-full px-4 py-2 rounded-md transition-colors ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {isLoading ? 'Creating...' : 'Create Trip'}
                </button>
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
        </div>
    );
};

// Main App component to handle authentication and data display
const App = () => {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    try {
                        if (__initial_auth_token) {
                            const userCred = await signInWithCustomToken(auth, __initial_auth_token);
                            setUserId(userCred.user.uid);
                        } else {
                            const userCred = await signInAnonymously(auth);
                            setUserId(userCred.user.uid);
                        }
                    } catch (error) {
                        console.error("Authentication failed:", error);
                    }
                }
                setIsAuthReady(true);
            });
            return () => unsubscribe();
        }
    }, []);

    useEffect(() => {
        if (!isAuthReady || !userId) return;

        const tripsPath = `apps/fleet-track-app/users/${userId}/trips`;
        const unsubscribe = onSnapshot(
            collection(db, tripsPath),
            (snapshot) => {
                const tripsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    let dailyLogs = [];
                    // ✅ FIX: Parse the dailyLogs string back into an array
                    if (data.analysis?.dailyLogs && typeof data.analysis.dailyLogs === 'string') {
                        try {
                            dailyLogs = JSON.parse(data.analysis.dailyLogs);
                        } catch (e) {
                            console.error("Failed to parse dailyLogs:", e);
                        }
                    } else if (Array.isArray(data.analysis?.dailyLogs)) {
                        dailyLogs = data.analysis.dailyLogs;
                    }
                    return {
                        id: doc.id,
                        ...data,
                        analysis: {
                            ...data.analysis,
                            dailyLogs: dailyLogs,
                        },
                    };
                });
                setTrips(tripsData);
            },
            (error) => {
                console.error("Failed to fetch trips:", error);
            }
        );

        return () => unsubscribe();
    }, [isAuthReady, userId]);

    const handleTripCreated = (newTrip) => {
        console.log("Trip created:", newTrip);
    };

    if (!isAuthReady) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-gray-500">
                Loading...
            </div>
        );
    }

    return (
        <div className="p-6">
            <TripPlanner userId={userId} onTripCreated={handleTripCreated} />
            {/* Display the created trips */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-center">Your Planned Trips <svg className="inline-block w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2h-2" />
                </svg></h2>
                <div className="space-y-4">
                    {trips.length > 0 ? (
                        trips.map(trip => (
                            <div key={trip.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                <h3 className="text-lg font-bold text-blue-600">{trip.driver_name}</h3>
                                <p className="text-sm text-gray-500">ID: {trip.id}</p>
                                <p className="mt-2">From: <span className="font-semibold">{trip.origin}</span> to <span className="font-semibold">{trip.destination}</span></p>
                                <p>Date: {trip.date}</p>
                                <p>Departure: {trip.departureTime}</p>
                                <p>Driver Cycle Used: {trip.cycleUsed} hrs</p>
                                <div className="mt-2 space-y-1 text-sm text-gray-700">
                                    <h4 className="font-semibold">Trip Analysis:</h4>
                                    <p>Profitability: <span className="text-green-600 font-bold">${(trip.analysis?.profitability?.distanceMiles * trip.analysis?.profitability?.inputs?.ratePerMile - trip.analysis?.profitability?.otherCosts).toFixed(2)}</span></p>
                                    <p>Estimated IFTA Tax: {trip.analysis?.ifta?.estimatedTax}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 italic">No trips planned yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
