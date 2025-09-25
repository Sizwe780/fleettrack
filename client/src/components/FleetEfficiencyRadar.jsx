import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart, RadialLinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

Chart.register(RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

export default function FleetEfficiencyRadar({ trips }) {
  const vehicleStats = {};

  trips.forEach(trip => {
    const id = trip.vehicleId || 'Unknown';
    if (!vehicleStats[id]) {
      vehicleStats[id] = {
        trips: 0,
        fuel: 0,
        delay: 0,
        trust: 100
      };
    }

    vehicleStats[id].trips += 1;
    vehicleStats[id].fuel += trip.fuelUsed || 0;
    vehicleStats[id].delay += trip.analysis?.delayRisk || 0;

    if (!trip.driverSignature) vehicleStats[id].trust -= 20;
    if (!trip.audit_hash) vehicleStats[id].trust -= 15;
    if (trip.breachDetected) vehicleStats[id].trust -= 25;
    if (!trip.versionHistory || trip.versionHistory.length === 0) vehicleStats[id].trust -= 10;
    if (trip.metadataFlags?.length > 0) vehicleStats[id].trust -= trip.metadataFlags.length * 5;
  });

  const labels = Object.keys(vehicleStats);
  const fuelData = labels.map(id => (vehicleStats[id].fuel / vehicleStats[id].trips).toFixed(2));
  const delayData = labels.map(id => (vehicleStats[id].delay / vehicleStats[id].trips).toFixed(2));
  const trustData = labels.map(id => Math.max(vehicleStats[id].trust, 0));

  const data = {
    labels,
    datasets: [
      {
        label: 'Avg Fuel (L)',
        data: fuelData,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: '#4bc0c0',
        borderWidth: 1
      },
      {
        label: 'Avg Delay Risk',
        data: delayData,
        backgroundColor: 'rgba(255,159,64,0.2)',
        borderColor: '#ff9f40',
        borderWidth: 1
      },
      {
        label: 'Trust Score',
        data: trustData,
        backgroundColor: 'rgba(54,162,235,0.2)',
        borderColor: '#36a2eb',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📊 Fleet Efficiency Radar</h2>
      <Radar data={data} />
    </div>
  );
}