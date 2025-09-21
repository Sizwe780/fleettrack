import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Star, User, Clock, Calendar, Gauge, CheckCircle, XCircle, Locate, Loader, Printer, StickyNote, Fuel, Bed } from 'lucide-react';
import { createRoot } from 'react-dom/client';

const App = () => {
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

  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3ODAiLCJhIjoiY2x1d2R5ZGZqMGQwMTJpcXBtYXk2dW1icSJ9.9j1hS_x2n3K7x_j5l001Q';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRemarkChange = (dayIndex, value) => {
    setLogRemarks(prevRemarks => ({
      ...prevRemarks,
      [dayIndex]: value
    }));
    // Update the remarks in the main log data state as well
    setLogData(prevLogs => {
      const newLogs = [...prevLogs];
      newLogs[dayIndex] = { ...newLogs[dayIndex], remarks: value };
      return newLogs;
    });
  };

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setLocationStatus(null);
    setMessage('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`)
            .then(response => response.json())
            .then(data => {
              const placeName = data.features[0]?.place_name || `Lat: ${latitude}, Lng: ${longitude}`;
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
      setMessage('Geolocation is not supported by your browser.');
      setMessageType('error');
      setLocationStatus('error');
      setIsLocating(false);
    }
  };

  const calculateHOS = (totalDistanceMiles) => {
    const speed = 50; // Average truck speed in mph
    const totalDrivingHours = totalDistanceMiles / speed;
    const initialCycleHours = parseFloat(formData.cycleUsed) || 0;
    const driverCycle = 70; // 70 hours over 8 days
    const dailyDrivingLimit = 11;
    const dailyOnDutyLimit = 14;
    const dailyOffDutyRequired = 10;
    const maxFuelDistance = 1000;

    let remainingCycleHours = driverCycle - initialCycleHours;
    let days = 1;
    let distanceCovered = 0;
    let logs = [];
    let stops = [];

    while (distanceCovered < totalDistanceMiles && remainingCycleHours > 0 && days <= 8) {
      let dailyDriving = Math.min(dailyDrivingLimit, totalDrivingHours - (distanceCovered / speed));
      let dailyOnDuty = Math.min(dailyOnDutyLimit, dailyDriving + 2); // 2 hours for stops/inspections
      
      let offDuty = Math.max(0, 24 - dailyOnDuty);
      if (offDuty < dailyOffDutyRequired) {
        offDuty = dailyOffDutyRequired;
        dailyOnDuty = 24 - offDuty;
        dailyDriving = Math.min(dailyDriving, dailyOnDuty - 2);
      }

      if (remainingCycleHours < dailyOnDuty) {
        dailyOnDuty = remainingCycleHours;
        dailyDriving = Math.min(dailyDriving, dailyOnDuty - 2);
        if (dailyDriving < 0) dailyDriving = 0;
      }
      
      remainingCycleHours -= dailyOnDuty;
      distanceCovered += dailyDriving * speed;

      const log = {
        day: days,
        driving: dailyDriving.toFixed(2),
        onDuty: dailyOnDuty.toFixed(2),
        offDuty: offDuty.toFixed(2),
        sleeperBerth: 0,
        remarks: '',
        date: new Date(new Date(formData.date).setDate(new Date(formData.date).getDate() + days - 1)).toISOString().slice(0, 10),
        driverName: formData.driverName,
        vehicleNumber: formData.vehicleNumber,
      };
      logs.push(log);
      days++;

      if (distanceCovered >= maxFuelDistance * stops.filter(s => s.type === 'fuel').length + maxFuelDistance) {
        stops.push({ name: `Fuel Stop (Day ${days - 1})`, type: 'fuel', day: days - 1 });
      }
      if (log.onDuty > 12) {
        stops.push({ name: `Rest Stop (Day ${days - 1})`, type: 'rest', day: days - 1 });
      }
    }

    return { logs, stops };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsLoading(true);

    const geocode = (location) => {
      return fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`)
        .then(res => res.json())
        .then(data => {
          if (data.features.length > 0) {
            return data.features[0].geometry.coordinates;
          }
          throw new Error(`Could not find coordinates for ${location}`);
        });
    };

    const getRoute = async () => {
      try {
        const [originCoords, destinationCoords] = await Promise.all([
          geocode(formData.origin),
          geocode(formData.destination)
        ]);

        const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destinationCoords[0]},${destinationCoords[1]}?geometries=polyline6&access_token=${MAPBOX_ACCESS_TOKEN}`;
        const routeRes = await fetch(routeUrl);
        const routeData = await routeRes.json();
        
        if (routeData.routes && routeData.routes.length > 0) {
          const route = routeData.routes[0];
          const totalDistanceMiles = route.distance / 1609.34; // Convert meters to miles
          
          const { logs, stops } = calculateHOS(totalDistanceMiles);

          setMapData({
            routePolyline: route.geometry,
            stops: stops.map(stop => {
              const routePoint = Math.floor(Math.random() * route.geometry.length);
              return {
                ...stop,
                lat: route.geometry[routePoint][1],
                lng: route.geometry[routePoint][0],
              };
            })
          });
          setLogData(logs);
          setLogRemarks(Object.fromEntries(logs.map((log, index) => [index, ''])));

          setMessage('Trip planned successfully! Check the Map and Logs tabs.');
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
    
    getRoute();
  };

  const TripMap = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
  
    useEffect(() => {
      if (!mapData || !window.mapboxgl || !mapContainer.current) {
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
        center: [-98.5833, 39.8333],
        zoom: 3,
      });
  
      map.current.on('load', () => {
        const coordinates = window.mapboxgl.GeometryUtil.decode(mapData.routePolyline);
        
        if (coordinates.length > 0) {
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
  
        mapData.stops.forEach(stop => {
          const markerColor = stop.type === 'fuel' ? '#f59e0b' : '#10b981';
          new window.mapboxgl.Marker({ color: markerColor })
            .setLngLat([stop.lng, stop.lat])
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
    }, [mapData]);
  
    if (!mapData) {
      return (
        <div className="flex items-center justify-center h-96 p-8 text-center text-gray-500">
          <p>Submit a trip to see the map with your planned route and stops.</p>
        </div>
      );
    }
    return <div ref={mapContainer} className="h-[600px] w-full rounded-2xl shadow-xl" />;
  };

  const ELDLogSheet = () => {
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
          <p className="mb-4">No ELD log data available. Submit a trip to generate logs.</p>
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
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
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

  const Reports = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Trip Reports</h2>
        <p className="text-center text-gray-600 mb-8">
          This section will provide detailed analytics and reports for your past trips.
        </p>
        <div className="p-8 bg-gray-50 rounded-lg w-full text-center text-gray-500">
          <p>Reports feature coming soon!</p>
        </div>
      </div>
    );
  };
  

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
                      disabled={isLocating}
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
                    disabled={isLoading}
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
      <script src="https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@mapbox/polyline@1.1.1/src/polyline.min.js"></script>
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
