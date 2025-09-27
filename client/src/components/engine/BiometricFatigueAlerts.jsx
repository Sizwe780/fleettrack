import React from 'react';
import { estimateFatigue } from '../engines/engines';

export default function BiometricFatigueAlerts({ driver }) {
  const fatigue = estimateFatigue(driver);

  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-navy mb-2">😴 Biometric Fatigue Monitor</h3>
      <p className="text-sm text-gray-700 mb-2">Driver: <strong>{driver.name}</strong></p>
      <p>Fatigue Level: <strong>{fatigue.fatigueLevel}</strong></p>
      <p>Status: <span className="font-bold text-red-600">{fatigue.status}</span></p>
    </section>
  );
}