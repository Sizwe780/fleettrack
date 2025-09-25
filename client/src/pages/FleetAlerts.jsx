import React from "react";

const FleetAlerts = ({ alerts = [] }) => {
  return (
    <div className="fleet-alerts">
      <h3>Fleet Alerts</h3>
      {alerts.length === 0 ? (
        <p>No active alerts</p>
      ) : (
        <ul>
          {alerts.map((alert, index) => (
            <li key={index}>{alert.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FleetAlerts;