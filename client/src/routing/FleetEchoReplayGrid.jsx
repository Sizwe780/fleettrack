// src/ops/FleetEchoReplayGrid.jsx
import React from 'react';

export default function FleetEchoReplayGrid({ tripData }) {
  return (
    <div className="replay-grid">
      <h3>Fleet Replay</h3>
      <table>
        <thead>
          <tr><th>Time</th><th>Location</th><th>Event</th></tr>
        </thead>
        <tbody>
          {tripData.map((trip, index) => (
            <tr key={index}>
              <td>{trip.timestamp}</td>
              <td>{trip.location}</td>
              <td>{trip.event}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}