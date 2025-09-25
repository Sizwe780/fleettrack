import React from 'react';

export default function MissionReplayPanel({ mission }) {
  return (
    <div className="p-4 bg-white rounded shadow text-sm">
      <h4 className="font-semibold mb-2">🔁 Mission Replay</h4>
      <ul className="space-y-1">
        {mission.legs.map((leg, i) => (
          <li key={i}>
            {leg.mode} — {leg.origin} → {leg.destination} — Delay: {leg.delay}min — Reroute: {leg.rerouted ? '✅' : '❌'}
          </li>
        ))}
      </ul>
    </div>
  );
}