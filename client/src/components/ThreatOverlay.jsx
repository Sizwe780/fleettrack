// cockpit/modules/ThreatOverlay.jsx
import React, { useEffect, useState } from 'react';

const ThreatOverlay = ({ userId, vehicleId }) => {
  const [threatScore, setThreatScore] = useState(null);

  useEffect(() => {
    fetch(`/api/threat-score?userId=${userId}&vehicleId=${vehicleId}`)
      .then(res => res.json())
      .then(data => setThreatScore(data.score));
  }, [userId, vehicleId]);

  return (
    <div className="overlay threat">
      <h4>Threat Score</h4>
      <div className={`score ${threatScore > 70 ? 'high' : 'low'}`}>
        {threatScore ?? 'Loading...'}
      </div>
    </div>
  );
};

export default ThreatOverlay;