import React, { useEffect, useState } from 'react';
import { fetchTrafficIncidents } from '../utils/TrafficIncidentFeed';

export default function TripIncidentPanel({ bbox }) {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const loadIncidents = async () => {
      const data = await fetchTrafficIncidents(bbox);
      setIncidents(data);
    };
    loadIncidents();
  }, [bbox]);

  return (
    <div className="mt-4 p-4 bg-yellow-50 rounded text-xs">
      <h4 className="font-semibold mb-2">🚧 Traffic Alerts</h4>
      {incidents.length === 0 ? (
        <p>No incidents reported.</p>
      ) : (
        <ul className="space-y-1">
          {incidents.map((i, idx) => (
            <li key={idx}>{i.description}</li>
          ))}
        </ul>
      )}
    </div>
  );
}