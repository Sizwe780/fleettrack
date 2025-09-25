import React from 'react';
import './Logsheet.css';

const TripVersionViewer = ({ trip }) => {
  const { versionHistory } = trip;

  if (!versionHistory?.length) {
    return (
      <section className="logsheet-section">
        <h2>Version History</h2>
        <p>No version history available for this trip.</p>
      </section>
    );
  }

  return (
    <section className="logsheet-section">
      <h2>Version History</h2>
      <ul>
        {versionHistory.map((version, i) => (
          <li key={i}>
            <strong>Version {version.version}</strong> — {new Date(version.timestamp).toLocaleString()}
            {version.editor && <span> by {version.editor}</span>}
            <ul style={{ marginLeft: '20px' }}>
              {version.changes.map((change, j) => (
                <li key={j}>🔄 {change}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TripVersionViewer;