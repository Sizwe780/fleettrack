// compliance/LogsheetRenderer.tsx
import React from 'react';

const LogsheetRenderer = ({ entries }) => (
  <div className="logsheet">
    <h2>Fleet Compliance Logsheet</h2>
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Event</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, i) => (
          <tr key={i}>
            <td>{entry.timestamp}</td>
            <td>{entry.type}</td>
            <td>{JSON.stringify(entry.payload)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default LogsheetRenderer;