import React from 'react';

const TripScoreBadge = ({ score }) => {
  const { efficiency, risk, compliance } = score;

  return (
    <div className="flex flex-col md:flex-row gap-4 text-sm">
      <div className={`px-3 py-1 rounded-full ${efficiency > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        ⚡ Efficiency: {efficiency}%
      </div>
      <div className={`px-3 py-1 rounded-full ${risk < 30 ? 'bg-green-100 text-green-800' : risk < 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
        🚨 Risk: {risk}%
      </div>
      <div className={`px-3 py-1 rounded-full ${compliance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        🧠 Compliance: {compliance ? 'Yes' : 'Violation'}
      </div>
    </div>
  );
};

export default TripScoreBadge;