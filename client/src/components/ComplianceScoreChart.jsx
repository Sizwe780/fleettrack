import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function ComplianceScoreChart() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('/api/compliance-score')
      .then(res => res.json())
      .then(data => setScores(data));
  }, []);

  const data = {
    labels: scores.map(s => s.driver),
    datasets: [{
      label: 'Compliance Score',
      data: scores.map(s => s.score),
      borderColor: 'green',
      fill: false
    }]
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-bold mb-2">✅ Compliance Scores</h3>
      <Line data={data} />
    </div>
  );
}