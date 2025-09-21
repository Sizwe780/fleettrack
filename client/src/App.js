import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

// Define the global Firebase variables
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// The main App component
const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize Firebase and authenticate the user
  useEffect(() => {
    try {
      if (Object.keys(firebaseConfig).length > 0) {
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const authService = getAuth(app);
        setDb(firestoreDb);
        setAuth(authService);

        const signIn = async () => {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(authService, initialAuthToken);
            } else {
              await signInAnonymously(authService);
            }
          } catch (error) {
            console.error("Firebase Auth error:", error);
          }
        };

        const unsubscribe = onAuthStateChanged(authService, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("Authenticated user:", user.uid);
          } else {
            console.log("No user is signed in.");
            signIn();
          }
        });

        return () => unsubscribe();
      } else {
        console.warn("Firebase config is missing. The app will not save data.");
      }
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, []);

  // Set up the Firestore listener to get real-time trip data
  useEffect(() => {
    if (db && userId) {
      const q = query(
        collection(db, `artifacts/${appId}/users/${userId}/trips`),
        orderBy("timestamp", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTrips = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrips(fetchedTrips);
      }, (error) => {
        console.error("Error fetching trips:", error);
      });

      return () => unsubscribe();
    }
  }, [db, userId]);

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

        const tripsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/trips`);
        await addDoc(tripsCollectionRef, tripData);

        // Clear form fields on successful submission
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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
                  className="input-field w-full pr-10"
                  placeholder="Enter your current location..."
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button type="submit" className="submit-button">Log Trip</button>
          </div>
        </form>
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
              <div key={trip.id} className="bg-gray-50 p-6 rounded-lg shadow-inner">
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
    <div className="min-h-screen bg-gray-100 p-8 font-sans antialiased flex flex-col items-center">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 mt-6 tracking-tight">Fleettrack</h1>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center text-lg text-gray-600">
            <span className="font-semibold text-indigo-600">Logged in as:</span> {userId || 'Authenticating...'}
          </div>
        </div>
        <TripForm />
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

      {/* Tailwind CSS CDN Script */}
      <script src="https://cdn.tailwindcss.com"></script>
    </div>
  );
};

export default App;
