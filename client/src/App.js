import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle, XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed, Database, ListChecks, TrendingUp, Info } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, orderBy, where, getDocs, setLogLevel } from 'firebase/firestore';

// Ensure the Mapbox library is loaded for the map functionality
const Mapbox = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.js';
    script.async = true;
    document.body.appendChild(script);

    const style = document.createElement('link');
    style.href = 'https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.css';
    style.rel = 'stylesheet';
    document.head.appendChild(style);
  }, []);
  return null;
};

const mockBackendResponse = {
  route: {
    distance_miles: 1500,
    duration_hours: 25,
    stops: [
      { type: "rest", location: "Nashville, TN", duration: 10, notes: "Mandatory 10-hour rest break." },
      { type: "fuel", location: "Memphis, TN", notes: "Fueling and pre-trip inspection." },
      { type: "rest", location: "Dallas, TX", duration: 8, notes: "Mandatory 8-hour rest break." },
      { type: "fuel", location: "Austin, TX", notes: "Fueling and post-trip inspection." },
    ]
  },
  logs: [
    {
      date: "2025-09-22",
      log_entries: [
        { time: "06:00", status: "Off Duty" },
        { time: "07:00", status: "Driving" },
        { time: "12:00", status: "On Duty" },
        { time: "13:00", status: "Off Duty" },
        { time: "14:00", status: "Driving" },
        { time: "19:00", status: "On Duty" },
        { time: "20:00", status: "Sleeper Berth" },
      ]
    },
    {
      date: "2025-09-23",
      log_entries: [
        { time: "05:00", status: "Off Duty" },
        { time: "06:00", status: "Driving" },
        { time: "11:00", status: "On Duty" },
        { time: "12:00", status: "Off Duty" },
        { time: "13:00", status: "Driving" },
        { time: "18:00", status: "On Duty" },
        { time: "19:00", status: "Sleeper Berth" },
      ]
    },
  ]
};

const DailyLogSheet = ({ date, logEntries, driverName, vehicleNumber }) => {
  const statuses = ["Off Duty", "Sleeper Berth", "Driving", "On Duty"];
  const getStatusIndex = (status) => statuses.indexOf(status);

  const renderLogGrid = () => {
    const grid = Array(statuses.length).fill(null).map(() => Array(24).fill(''));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    for (let i = 0; i < logEntries.length - 1; i++) {
      const entry = logEntries[i];
      const nextEntry = logEntries[i + 1];
      const startHour = parseInt(entry.time.split(':')[0]);
      const endHour = parseInt(nextEntry.time.split(':')[0]);
      const statusIndex = getStatusIndex(entry.status);

      for (let h = startHour; h < endHour; h++) {
        grid[statusIndex][h] = 'filled';
      }
    }
    return (
      <div className="relative border border-gray-300 rounded-lg overflow-hidden">
        <div className="flex bg-gray-100 text-xs font-medium border-b border-gray-300">
          <div className="w-16 px-2 py-1 text-center border-r border-gray-300">Status</div>
          {hours.map(h => (
            <div key={h} className="flex-1 py-1 text-center border-r border-gray-300">{h}</div>
          ))}
        </div>
        <div className="flex flex-col">
          {statuses.map((status, i) => (
            <div key={status} className="flex border-b border-gray-300 last:border-b-0">
              <div className="w-16 px-2 py-1 flex items-center justify-center text-[10px] text-gray-600 border-r border-gray-300">{status}</div>
              {hours.map(h => (
                <div key={h} className={`flex-1 h-8 border-r border-gray-300 ${grid[i][h] === 'filled' ? 'bg-blue-200' : ''}`}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <StickyNote size={20} /> Daily Log Sheet
        </h3>
        <span className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-700">
        <div><span className="font-semibold">Driver:</span> {driverName}</div>
        <div><span className="font-semibold">Vehicle:</span> {vehicleNumber}</div>
      </div>
      {renderLogGrid()}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    driverName: '',
    vehicleNumber: '',
    cycleUsed: '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tripLogs, setTripLogs] = useState([]);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const mapRef = useRef(null);

  // Firestore & Auth initialization
  useEffect(() => {
    try {
      setLogLevel('debug');
      const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authentication = getAuth(app);
      setDb(firestore);
      setAuth(authentication);

      onAuthStateChanged(authentication, (user) => {
        if (user) {
          setUserId(user.uid);
          // Only fetch data after the user is authenticated
          fetchTripLogs(firestore, user.uid);
        } else {
          const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
          if (initialAuthToken) {
            signInWithCustomToken(authentication, initialAuthToken).catch(console.error);
          } else {
            signInAnonymously(authentication).catch(console.error);
          }
        }
      });
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, []);

  // Fetch data from Firestore
  const fetchTripLogs = (firestore, currentUserId) => {
    if (!firestore || !currentUserId) return;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const logsCollectionRef = collection(firestore, `artifacts/${appId}/users/${currentUserId}/trip_logs`);

    const unsubscribe = onSnapshot(logsCollectionRef, (snapshot) => {
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      setTripLogs(logs);
    }, (error) => {
      console.error("Failed to fetch trip logs:", error);
      setMessage("Failed to load trip logs. Please try again.");
      setMessageType("error");
    });
    return () => unsubscribe();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleCreateTrip = async () => {
    if (!db || !userId) {
      setMessage("Authentication is not ready. Please wait.");
      setMessageType("warning");
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const logsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/trip_logs`);
      await addDoc(logsCollectionRef, {
        ...formData,
        createdAt: new Date(),
        userId: userId,
        ...mockBackendResponse // Add the mock backend data to Firestore
      });
      setMessage("Trip created successfully!");
      setMessageType("success");
      setFormData({ origin: '', destination: '', date: '', driverName: '', vehicleNumber: '', cycleUsed: '' });
      setActiveTab('logs');
    } catch (error) {
      console.error("Error adding document:", error);
      setMessage("Failed to create trip. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const Message = ({ text, type }) => {
    if (!text) return null;
    const isError = type === 'error' || type === 'warning';
    const bgColor = isError ? 'bg-red-50' : 'bg-green-50';
    const textColor = isError ? 'text-red-700' : 'text-green-700';
    const icon = isError ? <XCircle size={20} /> : <CheckCircle size={20} />;

    return (
      <div className={`rounded-lg p-4 flex items-center space-x-2 mt-4 shadow-sm ${bgColor} ${textColor}`}>
        {icon}
        <p className="text-sm font-medium">{text}</p>
      </div>
    );
  };

  // Helper for tab styling
  const tabButtonClass = (tabName) =>
    `px-4 py-2 rounded-full transition-colors duration-200 font-medium ${
      activeTab === tabName
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <Mapbox />
        <div className="flex flex-col md:flex-row h-full">
          {/* Main Content Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            <header className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                <Truck size={36} className="text-indigo-600" />
                FleetTrack
              </h1>
              <div className="text-sm text-gray-500">
                User ID: <span className="font-mono text-gray-800 break-all">{userId || 'Loading...'}</span>
              </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="mb-8">
              <ul className="flex justify-center md:justify-start space-x-2 md:space-x-4 p-1 bg-gray-200 rounded-full">
                <li><button onClick={() => setActiveTab('home')} className={tabButtonClass('home')}><MapPin size={18} className="inline mr-2" />Trip Input</button></li>
                <li><button onClick={() => setActiveTab('logs')} className={tabButtonClass('logs')}><ListChecks size={18} className="inline mr-2" />Daily Logs</button></li>
                <li><button onClick={() => setActiveTab('reports')} className={tabButtonClass('reports')}><TrendingUp size={18} className="inline mr-2" />Reports</button></li>
              </ul>
            </nav>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'home' && (
                <div className="space-y-6">
                  <div className="p-6 bg-indigo-50 rounded-lg shadow-inner">
                    <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center gap-2"><Info size={24} />Trip Details</h2>
                    <p className="text-indigo-700">Fill out the form below to get your route instructions and daily logs.</p>
                  </div>
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreateTrip(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="origin" className="text-sm font-medium text-gray-700 flex items-center gap-2"><MapPin size={16} />Current Location</label>
                        <input type="text" id="origin" name="origin" value={formData.origin} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter current location" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="destination" className="text-sm font-medium text-gray-700 flex items-center gap-2"><Star size={16} />Dropoff Location</label>
                        <input type="text" id="destination" name="destination" value={formData.destination} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter dropoff location" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="driverName" className="text-sm font-medium text-gray-700 flex items-center gap-2"><User size={16} />Driver Name</label>
                        <input type="text" id="driverName" name="driverName" value={formData.driverName} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition" placeholder="e.g., John Doe" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="cycleUsed" className="text-sm font-medium text-gray-700 flex items-center gap-2"><Gauge size={16} />Current Cycle Used (Hrs)</label>
                        <input type="number" id="cycleUsed" name="cycleUsed" value={formData.cycleUsed} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition" placeholder="e.g., 20" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700 flex items-center gap-2"><Truck size={16} />Vehicle Number</label>
                        <input type="text" id="vehicleNumber" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition" placeholder="e.g., V-12345" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="date" className="text-sm font-medium text-gray-700 flex items-center gap-2"><Calendar size={16} />Date</label>
                        <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition" required />
                      </div>
                    </div>
                    <Message text={message} type={messageType} />
                    <button type="submit" className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-300 font-semibold flex items-center justify-center gap-2" disabled={isLoading}>
                      {isLoading ? <Loader size={20} className="animate-spin" /> : <ListChecks size={20} />}
                      {isLoading ? 'Creating Trip...' : 'Create Trip & View Logs'}
                    </button>
                  </form>
                </div>
              )}
              {activeTab === 'logs' && (
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-lg shadow-inner">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2"><ListChecks size={24} />Daily Logs</h2>
                    <p className="text-blue-700">Here you can view your automatically generated daily logs.</p>
                  </div>
                  {tripLogs.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">No trips created yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {tripLogs.map((log) => (
                        <DailyLogSheet
                          key={log.id}
                          date={log.date}
                          logEntries={log.logs[0].log_entries}
                          driverName={log.driverName}
                          vehicleNumber={log.vehicleNumber}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="p-6 bg-green-50 rounded-lg shadow-inner">
                    <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2"><TrendingUp size={24} />Reports</h2>
                    <p className="text-green-700">View performance reports and historical data for your trips.</p>
                  </div>
                  <div className="space-y-6">
                    {tripLogs.length === 0 ? (
                      <div className="text-center p-8 text-gray-500">No trips created yet.</div>
                    ) : (
                      <div className="p-6 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold mb-4">Trip Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
                            <Clock size={24} className="text-indigo-500" />
                            <div>
                              <p className="text-sm text-gray-500">Total Driving Hours</p>
                              <p className="font-semibold text-lg">{tripLogs[0].route.duration_hours} hrs</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
                            <Gauge size={24} className="text-orange-500" />
                            <div>
                              <p className="text-sm text-gray-500">Total Miles</p>
                              <p className="font-semibold text-lg">{tripLogs[0].route.distance_miles} miles</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
                            <Bed size={24} className="text-red-500" />
                            <div>
                              <p className="text-sm text-gray-500">Scheduled Rests</p>
                              <p className="font-semibold text-lg">{tripLogs[0].route.stops.filter(s => s.type === 'rest').length} stops</p>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mt-8 mb-4">Trip Route & Stops</h3>
                        <ul className="space-y-4">
                          {tripLogs[0].route.stops.map((stop, index) => (
                            <li key={index} className="flex items-start gap-3 p-4 bg-gray-100 rounded-lg shadow-sm">
                              <MapPin size={24} className="text-green-600 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold text-lg flex items-center gap-2">{stop.location}</h4>
                                <p className="text-sm text-gray-600">{stop.notes}</p>
                                {stop.type === 'rest' && <p className="text-xs text-gray-500 mt-1">Duration: {stop.duration} hrs</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
