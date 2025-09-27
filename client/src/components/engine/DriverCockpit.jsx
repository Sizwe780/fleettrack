import React from 'react';

export default function DriverCockpit({ driverType, snapshot }) {
  const overlays = {
    pro: ["Advanced metrics", "Voice console", "Predictive overlays"],
    novice: ["Simplified UI", "Guided replay", "Hazard warnings"],
    fatigued: ["Fatigue alerts", "Reroute suggestions", "Biometric nudges"],
    disabled: ["High contrast", "ARIA roles", "Screen reader support"],
    security: ["Encrypted logs", "Override console", "Audit viewer"]
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-navy mb-2">🧑‍✈️ {driverType.toUpperCase()} Cockpit</h3>
      <ul className="list-disc ml-4 text-sm text-gray-700 mb-4">
        {overlays[driverType]?.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      <pre className="text-xs bg-gray-50 p-3 rounded whitespace-pre-wrap break-words">
        {JSON.stringify(snapshot, null, 2)}
      </pre>
    </section>
  );
}