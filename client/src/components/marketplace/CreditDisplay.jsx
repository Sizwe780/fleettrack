import React from 'react';

const CreditDisplay = ({ credits, badges }) => (
  <div className="credit-display">
    <p><strong>Credits:</strong> {credits}</p>
    <div className="badge-list">
      {badges.map((badge, i) => (
        <span key={i} className="badge">{badge}</span>
      ))}
    </div>
  </div>
);

export default CreditDisplay;