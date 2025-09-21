/* global __app_id, __firebase_config, __initial_auth_token, mapboxgl, L */
import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle, XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed, Database, ListChecks, TrendingUp, Info } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, orderBy, where, getDocs, setLogLevel } from 'firebase/firestore';

const App = () => {
  // State management for UI tabs and form data
  const [activeTab, setActiveTab] = useState('home');
  const [currentLocation, setCurrentLocation] = useState('');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    driverName: '',
    vehicleNumber: '',
    cycleUsed: '',
    departureTime: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [mapData, setMapData] = useState(null);
  const [logData, setLogData] = useState([]);
  const [logRemarks, setLogRemarks] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  // State for Firebase and Mapbox
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isMapboxLoaded, setIsMapboxLoaded] = useState(false);

  // Accessing global variables injected by the environment
  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3ODAiLCJhIjoiY2x1d2R5ZGZqMGQwMTJpcXBtYXk2dW1icSJ9.9j1hS_x2n3K7x_j5l001Q';
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  // Effect to initialize Firebase and authentication
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const dbInstance = getFirestore(app);
      const authInstance = getAuth(app);
      setDb(dbInstance);
      setAuth(authInstance);
      setLogLevel('debug');

      onAuthStateChanged(authInstance, async (authUser) => {
        if (authUser) {
          setUser(authUser);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(authInstance, initialAuthToken);
            } else {
              await signInAnonymously(authInstance);
            }
          } catch (error) {
            console.error("Firebase Auth Error:", error);
          }
        }
        setIsAuthReady(true);
      });
    } catch (e) {
      console.error("Firebase Initialization Error:", e);
    }
  }, []);

  // Effect to load external scripts (Mapbox)
  useEffect(() => {
    const loadScripts = () => {
      const mapboxglScript = document.createElement('script');
      mapboxglScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.js';
      mapboxglScript.onload = () => {
        const polylineScript = document.createElement('script');
        polylineScript.src = 'https://cdn.jsdelivr.net/npm/@mapbox/polyline@1.1.1/src/polyline.min.js';
        polylineScript.onload = () => {
          setIsMapboxLoaded(true);
        };
        document.body.appendChild(polylineScript);
      };
      document.body.appendChild(mapboxglScript);
    };

    loadScripts();
  }, []);

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for remarks on log sheets
  const handleRemarkChange = (dayIndex, value) => {
    setLogRemarks(prevRemarks => ({
      ...prevRemarks,
      [dayIndex]: value
    }));
    setLogData(prevLogs => {
      const newLogs = [...prevLogs];
      newLogs[dayIndex] = { ...newLogs[dayIndex], remarks: value };
      return newLogs;
    });
  };

  // Handler to get the user's current location via Geolocation API
  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setLocationStatus(null);
    setMessage('');
    if (navigator.geolocation && isMapboxLoaded) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`)
            .then(response => response.json())
            .then(data => {
              const placeName = data.features?.[0]?.place_name || `Lat: ${latitude}, Lng: ${longitude}`;
              setCurrentLocation(placeName);
              setLocationStatus('success');
              setIsLocating(false);
            })
            .catch(error => {
              console.error('Error fetching location details:', error);
              setCurrentLocation(`Lat: ${latitude}, Lng: ${longitude}`);
              setLocationStatus('success');
              setIsLocating(false);
            });
        },
        (error) => {
          console.error('Geolocation Error:', error);
          let errorMessage = 'Failed to get location.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Permission denied. Please enable location services.';
          }
          setMessage(errorMessage);
          setMessageType('error');
          setLocationStatus('error');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setMessage('Geolocation is not supported or Mapbox is not yet loaded.');
      setMessageType('error');
      setLocationStatus('error');
      setIsLocating(false);
    }
  };

  // Core logic to calculate Hours of Service (HOS) and stops
  const calculateHOS = (totalDistanceMiles) => {
    const speed = 50;
    const drivingLimit = 11;
    const onDutyLimit = 14;
    const totalCycle = 70;
    const initialCycleUsed = parseFloat(formData.cycleUsed) || 0;
    const pickupDropoffTime = 1; // 1 hour for pickup and dropoff
    const fuelStopInterval = 1000;

    let distanceRemaining = totalDistanceMiles;
    let cycleRemaining = totalCycle - initialCycleUsed;
    let days = 1;
    let logs = [];
    let stops = [];
    let cumulativeDistance = 0;

    while (distanceRemaining > 0 && days <= 8) {
      const dailyDriving = Math.min(drivingLimit, distanceRemaining / speed);
      let dailyOnDuty = dailyDriving + pickupDropoffTime;
      if (dailyOnDuty > onDutyLimit) dailyOnDuty = onDutyLimit;

      let dailyOffDuty = 24 - dailyOnDuty;
      if (dailyOffDuty < 10) dailyOffDuty = 10;
      
      if (cycleRemaining < dailyOnDuty) {
        dailyOnDuty = cycleRemaining;
      }
      
      const distanceToday = dailyDriving * speed;
      distanceRemaining -= distanceToday;
      cycleRemaining -= dailyOnDuty;
      cumulativeDistance += distanceToday;

      // Add a fuel stop if the cumulative distance since the last fuel stop is over 1000 miles
      if (Math.floor(cumulativeDistance / fuelStopInterval) > stops.filter(s => s.type === 'fuel').length) {
          stops.push({ name: `Fuel Stop`, type: 'fuel', day: days });
      }
      
      // Add a rest stop for every 14 hours on duty
      if (dailyOnDuty >= 14) {
          stops.push({ name: `Rest Stop`, type: 'rest', day: days });
      }

      const log = {
        day: days,
        driving: dailyDriving.toFixed(2),
        onDuty: dailyOnDuty.toFixed(2),
        offDuty: dailyOffDuty.toFixed(2),
        sleeperBerth: 0,
        remarks: '',
        date: new Date(new Date(formData.date).setDate(new Date(formData.date).getDate() + days - 1)).toISOString().slice(0, 10),
        driverName: formData.driverName,
        vehicleNumber: formData.vehicleNumber,
      };
      logs.push(log);
      days++;
    }

    return { logs, stops, totalDrivingHours: (totalDistanceMiles / speed).toFixed(2), totalDistanceMiles: totalDistanceMiles.toFixed(2), totalDays: days - 1 };
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsLoading(true);

    if (!isAuthReady || !user || !isMapboxLoaded) {
      setMessage('Application not ready. Please wait a moment and try again.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    // Geocoding function to get coordinates from an address
    const geocode = async (location) => {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`);
      const data = await response.json();
      if (data.features?.length > 0) {
        return data.features[0].geometry.coordinates;
      }
      throw new Error(`Could not find coordinates for ${location}`);
    };

    try {
      const [originCoords, destinationCoords] = await Promise.all([
        geocode(formData.origin),
        geocode(formData.destination)
      ]);

      const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destinationCoords[0]},${destinationCoords[1]}?geometries=polyline6&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const routeRes = await fetch(routeUrl);
      const routeData = await routeRes.json();
      
      if (routeData.routes?.[0]) {
        const route = routeData.routes[0];
        const totalDistanceMiles = route.distance / 1609.34;
        
        const { logs, stops, totalDrivingHours, totalDistanceMiles: finalDistance, totalDays } = calculateHOS(totalDistanceMiles);

        const newMapData = {
          routePolyline: route.geometry,
          originCoords,
          destinationCoords,
          stops: stops,
        };
        setMapData(newMapData);
        setLogData(logs);
        setLogRemarks(Object.fromEntries(logs.map((log, index) => [index, ''])));

        const tripDataToSave = {
          ...formData,
          ...newMapData,
          logs,
          totalDistanceMiles: finalDistance,
          totalDrivingHours,
          totalDays,
          timestamp: new Date().toISOString(),
          userId: user.uid,
        };

        const tripsCollectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'trips');
        await addDoc(tripsCollectionRef, tripDataToSave);
        
        setMessage('Trip planned and saved successfully! Check the Map and Logs tabs.');
        setMessageType('success');
        setActiveTab('map');
      } else {
        throw new Error('No routes found.');
      }
    } catch (error) {
      console.error('Trip planning failed:', error);
      setMessage(`Failed to plan trip: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Component for displaying the Map
  const TripMap = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
  
    useEffect(() => {
      if (!isMapboxLoaded || !mapData || !mapContainer.current) {
        return;
      }
  
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
  
      window.mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: mapData.originCoords,
        zoom: 3,
      });
  
      map.current.on('load', () => {
        const coordinates = window.mapboxgl.GeometryUtil.decode(mapData.routePolyline);
        
        if (coordinates?.length > 0) {
          map.current.addSource('route', {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
              }
            }
          });
          map.current.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#1E40AF',
              'line-width': 6
            }
          });
  
          const bounds = new window.mapboxgl.LngLatBounds();
          coordinates.forEach(coord => {
            bounds.extend(coord);
          });
          map.current.fitBounds(bounds, { padding: 50 });
        }
  
        mapData.stops?.forEach(stop => {
          const markerColor = stop.type === 'fuel' ? '#f59e0b' : '#10b981';
          new window.mapboxgl.Marker({ color: markerColor })
            .setLngLat(stop.coords)
            .setPopup(new window.mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${stop.name}</h3>`))
            .addTo(map.current);
        });
      });
      
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }, [mapData, isMapboxLoaded]);
  
    if (!mapData) {
      return (
        <div className="flex items-center justify-center h-96 p-8 text-center text-gray-500">
          <p>Submit a trip to see the map with your planned route and stops.</p>
        </div>
      );
    }

    if (!isMapboxLoaded) {
      return (
        <div className="flex items-center justify-center h-96 p-8 text-center text-gray-500">
          <p>Loading map dependencies...</p>
        </div>
      );
    }

    return <div ref={mapContainer} className="h-[600px] w-full rounded-2xl shadow-xl" />;
  };

  // Component for displaying and printing ELD logs
  const ELDLogSheet = () => {
    // Function to handle printing the canvas logs
    const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>ELD Log Sheets</title>
          <style>
            @media print {
              body { font-family: sans-serif; }
              .log-sheet { page-break-after: always; border: 1px solid black; padding: 20px; margin-bottom: 20px; }
              .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
              .chart-container { position: relative; width: 100%; height: 150px; }
              .grid-line { position: absolute; background-color: #e5e7eb; }
              .vertical-line { width: 1px; height: 100%; top: 0; }
              .horizontal-line { width: 100%; height: 1px; left: 0; }
              .chart-labels { display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px; }
              .remarks-section { margin-top: 20px; border-top: 1px solid black; padding-top: 10px; }
              .signature { margin-top: 30px; border-top: 1px solid black; padding-top: 5px; width: 250px; }
              .no-print { display: none; }
              p { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Daily ELD Log Sheets</h1>
          <div id="print-content"></div>
        </body>
        </html>
      `);
      const printContent = printWindow.document.getElementById('print-content');
      
      logData.forEach((log, index) => {
        const logContainer = document.createElement('div');
        logContainer.className = 'log-sheet';
        
        const headerInfo = document.createElement('div');
        headerInfo.className = 'header-info';
        headerInfo.innerHTML = `
          <div><strong>Driver:</strong> ${log.driverName}</div>
          <div><strong>Vehicle:</strong> ${log.vehicleNumber}</div>
          <div><strong>Date:</strong> ${log.date}</div>
        `;

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 300;
        
        const remarksSection = document.createElement('div');
        remarksSection.className = 'remarks-section';
        remarksSection.innerHTML = `
          <strong>Remarks:</strong>
          <p>${logRemarks[index] || ''}</p>
        `;

        const signatureSection = document.createElement('div');
        signatureSection.className = 'signature';
        signatureSection.innerHTML = `<strong>Driver Signature</strong>`;
        
        logContainer.appendChild(headerInfo);
        logContainer.appendChild(canvas);
        logContainer.appendChild(remarksSection);
        logContainer.appendChild(signatureSection);
        printContent.appendChild(logContainer);
        
        drawLogSheet(canvas, log);
      });
      
      printWindow.document.close();
      printWindow.print();
    };
    
    // Effect to draw logs on canvas whenever logData changes
    useEffect(() => {
      if (logData && logData.length > 0) {
        logData.forEach((log, index) => {
          const canvas = document.getElementById(`log-canvas-${index}`);
          if (canvas) {
            drawLogSheet(canvas, log);
          }
        });
      }
    }, [logData, logRemarks]);
  
    // Function to draw the HOS chart on a canvas
    const drawLogSheet = (canvas, log) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const chartHeight = 150;
      const statusHeight = chartHeight / 4;
      const startX = 50;
      const endX = width - 20;
      const startY = 50;
      const endY = startY + chartHeight;
      const totalHours = 24;
      
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      const statuses = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty'];
      for (let i = 0; i < 5; i++) {
        const y = startY + i * statusHeight;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
      
      for (let i = 0; i <= totalHours; i++) {
        const x = startX + (i / totalHours) * (endX - startX);
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#111827';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      statuses.forEach((status, i) => {
        ctx.fillText(status, startX - 5, startY + (i + 0.5) * statusHeight + 5);
      });
      
      ctx.textAlign = 'center';
      for (let i = 0; i <= totalHours; i += 2) {
        const x = startX + (i / totalHours) * (endX - startX);
        ctx.fillText(i, x, endY + 15);
      }
      
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      let currentHour = 0;
      const plotStatusLine = (status, hours, color) => {
        if (hours <= 0) return;
        const yMap = {
          'Off Duty': startY + statusHeight * 0.5,
          'Sleeper Berth': startY + statusHeight * 1.5,
          'Driving': startY + statusHeight * 2.5,
          'On Duty': startY + statusHeight * 3.5,
        };
        const y = yMap[status];
        const xStart = startX + (currentHour / totalHours) * (endX - startX);
        const xEnd = startX + ((currentHour + hours) / totalHours) * (endX - startX);
        
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(xStart, y);
        ctx.lineTo(xEnd, y);
        ctx.stroke();

        ctx.strokeStyle = '#111827';
        if (status !== 'On Duty' && (currentHour + hours) < 24) {
          ctx.beginPath();
          ctx.moveTo(xEnd, y);
          ctx.lineTo(xEnd, yMap[statuses[statuses.indexOf(status) + 1]] || y);
          ctx.stroke();
        }

        currentHour += hours;
      };

      plotStatusLine('Off Duty', log.offDuty, '#22c55e');
      plotStatusLine('Sleeper Berth', log.sleeperBerth, '#a855f7');
      plotStatusLine('Driving', log.driving, '#3b82f6');
      plotStatusLine('On Duty', log.onDuty, '#eab308');
    };
  
    if (!logData || logData.length === 0) {
      return (
        <div className="flex flex-col items-center p-8 text-center text-gray-500">
          <p>No ELD log data available. Submit a trip to generate logs.</p>
        </div>
      );
    }
  
    return (
      <div className="flex flex-col items-center gap-8 p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">Daily ELD Log Sheets</h2>
        <div className="w-full space-y-12">
          {logData.map((log, index) => (
            <div key={index} className="flex flex-col items-center border-b pb-8 last:border-b-0">
              <div className="w-full text-center mb-6">
                <p className="text-lg font-semibold">Day {log.day}: {log.driverName}</p>
                <p className="text-sm text-gray-600">Vehicle: {log.vehicleNumber} | Date: {log.date}</p>
              </div>
              <canvas
                id={`log-canvas-${index}`}
                width="800"
                height="250"
                className="w-full border rounded-lg shadow-inner"
              ></canvas>
              <div className="w-full mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <StickyNote size={16} /> Remarks:
                </h4>
                <textarea
                  className="w-full p-2 text-sm text-gray-800 border-none bg-transparent focus:ring-0 focus:border-0 resize-none"
                  rows="2"
                  value={logRemarks[index]}
                  onChange={(e) => handleRemarkChange(index, e.target.value)}
                  placeholder="Add your remarks here..."
                ></textarea>
              </div>
              <div className="w-full mt-6 text-right">
                <span className="text-sm text-gray-600">Driver Signature:</span>
                <div className="w-48 h-12 inline-block border-b-2 border-gray-400 ml-2"></div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handlePrint}
          className="mt-6 px-8 py-4 bg-gray-800 text-white font-semibold rounded-full shadow-lg hover:bg-gray-900 transition duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Printer size={20} /> Print Logs
        </button>
      </div>
    );
  };

  // Component for displaying trip reports from Firestore
  const Reports = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // Effect to fetch trip data from Firestore in real-time
    useEffect(() => {
      if (!isAuthReady || !user || !db) return;
      setLoading(true);
      const tripsCollectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'trips');
      
      const unsubscribe = onSnapshot(tripsCollectionRef, (querySnapshot) => {
        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        tripsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setTrips(tripsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching reports:", error);
        setLoading(false);
      });
      
      return () => unsubscribe();
    }, [isAuthReady, user, db, appId]);

    // Simple bar chart component for visualization
    const Chart = ({ data }) => {
      const maxMiles = Math.max(...data.map(d => parseFloat(d.totalDistanceMiles)), 0) || 1;
      const totalWidth = 600;
      const totalHeight = 300;
      const padding = 40;
      const barWidth = (totalWidth - 2 * padding) / (data.length * 1.5);
    
      return (
        <svg viewBox={`0 0 ${totalWidth} ${totalHeight}`} className="w-full h-auto">
          <rect x="0" y="0" width={totalWidth} height={totalHeight} fill="#F9FAFB" rx="12" ry="12" />
          <line x1={padding} y1={totalHeight - padding} x2={totalWidth - padding / 2} y2={totalHeight - padding} stroke="#D1D5DB" strokeWidth="2" />
          <line x1={padding} y1={totalHeight - padding} x2={padding} y2={padding} stroke="#D1D5DB" strokeWidth="2" />
          
          {data.map((trip, index) => {
            const miles = parseFloat(trip.totalDistanceMiles);
            const barHeight = (miles / maxMiles) * (totalHeight - 2 * padding);
            const x = padding + index * (barWidth * 1.5);
            const y = totalHeight - padding - barHeight;
            
            return (
              <g key={index}>
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  fill="#4F46E5" 
                  rx="4" 
                  ry="4"
                >
                  <title>{`${trip.origin} to ${trip.destination}: ${miles} miles`}</title>
                </rect>
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">{miles}</text>
                <text x={x + barWidth / 2} y={totalHeight - padding + 15} textAnchor="middle" fontSize="10" fill="#6B7280">{new Date(trip.timestamp).toLocaleDateString()}</text>
              </g>
            );
          })}
        </svg>
      );
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center">
            <Loader className="animate-spin text-indigo-600" size={48} />
            <p className="mt-4 text-gray-500">Loading trip data...</p>
          </div>
        </div>
      );
    }
    
    if (trips.length === 0) {
      return (
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Trip Reports</h2>
          <p className="text-center text-gray-600 mb-8">
            This section provides detailed analytics for your trips.
          </p>
          <div className="flex flex-col items-center justify-center h-64 p-8 bg-gray-50 rounded-lg w-full text-center text-gray-500">
            <Info className="mb-4" size={48} />
            <p>No trips have been planned yet. Go to the Home tab to start a new trip!</p>
            <p className="text-xs mt-2">Authenticated User ID: {user?.uid}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Trip Reports</h2>
        <p className="text-center text-gray-600 mb-8">
          A summary of your past trips, powered by Firestore.
        </p>
        <div className="w-full max-w-4xl mb-8">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp size={20} /> Miles Driven Per Trip
          </h3>
          <Chart data={trips} />
        </div>
        <div className="w-full max-w-4xl space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <ListChecks size={20} /> Past Trips
          </h3>
          {trips.map(trip => (
            <div key={trip.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">{trip.origin} to {trip.destination}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{trip.driverName}</span> | {trip.vehicleNumber}
                </p>
                <p className="text-sm text-gray-500">Planned on: {new Date(trip.timestamp).toLocaleDateString()}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-bold text-indigo-600">{trip.totalDistanceMiles} miles</p>
                <p className="text-sm text-gray-500">~{trip.totalDays} days</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // The main tab content renderer
  const TabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-center min-h-full px-4">
            <div className="max-w-7xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-4">
                Plan a New Trip
              </h1>
              <p className="text-center text-gray-600 mb-8 text-base">
                Enter the details below to begin your journey.
              </p>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="md:col-span-2 flex flex-col items-center justify-center gap-4">
                  <div className="flex items-center gap-4">
                    <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin size={20} /> Current Location
                    </label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating || !isMapboxLoaded}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-300
                        ${isLocating ? 'bg-indigo-400' :
                          locationStatus === 'success' ? 'bg-green-500' :
                          locationStatus === 'error' ? 'bg-red-500' :
                          'bg-gray-400 hover:bg-indigo-500'
                        }
                      `}
                    >
                      {isLocating ? (
                        <Loader size={20} className="animate-spin" />
                      ) : locationStatus === 'success' ? (
                        <CheckCircle size={20} />
                      ) : locationStatus === 'error' ? (
                        <XCircle size={20} />
                      ) : (
                        <Locate size={20} />
                      )}
                    </button>
                  </div>
                  {currentLocation && <span className="text-base font-medium text-indigo-600 text-center">{currentLocation}</span>}
                </div>
                <div className="flex flex-col">
                  <label htmlFor="origin" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Origin
                  </label>
                  <input
                    id="origin"
                    name="origin"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter origin city or address"
                    value={formData.origin}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="destination" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Destination
                  </label>
                  <input
                    id="destination"
                    name="destination"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter destination city or address"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Date
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="driverName" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} /> Driver Name
                  </label>
                  <input
                    id="driverName"
                    name="driverName"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Enter driver's name"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Truck size={16} /> Vehicle Number
                  </label>
                  <input
                    id="vehicleNumber"
                    name="vehicleNumber"
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="e.g., ABC-123"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="cycleUsed" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Gauge size={16} /> Cycle Used (Hrs)
                  </label>
                  <input
                    id="cycleUsed"
                    name="cycleUsed"
                    type="number"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="e.g., 20"
                    value={formData.cycleUsed}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="departureTime" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} /> Departure Time
                  </label>
                  <input
                    id="departureTime"
                    name="departureTime"
                    type="time"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="md:col-span-2 flex justify-center mt-6">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 disabled:bg-indigo-400"
                    disabled={isLoading || !isAuthReady || !isMapboxLoaded}
                  >
                    {isLoading ? 'Planning Trip...' : 'Plan Trip'}
                  </button>
                </div>
              </form>
              {message && (
                <div className={`mt-8 p-4 rounded-lg flex items-center justify-center gap-2 ${
                  messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {messageType === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'map':
        return <TripMap />;
      case 'logs':
        return <ELDLogSheet />;
      case 'reports':
        return <Reports />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans antialiased">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.css" rel="stylesheet" />
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-indigo-600" />
          <span className="text-2xl font-bold text-gray-900">FleetTrack</span>
          <Star className="text-yellow-500 w-5 h-5" fill="currentColor" />
        </div>
        <nav>
          <ul className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'home'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'map'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Map
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'logs'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Logs
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Reports
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main className="container mx-auto py-8 px-4">
        <TabContent />
      </main>

      <footer className="w-full text-center py-6 text-gray-500 text-sm">
        <p>
          Need to reach out? Contact us at{' '}
          <a href="mailto:sizwe.ngwenya78@gmail.com" className="text-indigo-600 hover:underline">
            sizwe.ngwenya78@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
