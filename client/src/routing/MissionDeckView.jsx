// src/components/cockpit/MissionDeckView.jsx
import React from 'react';

export default function MissionDeckView({ role }) {
  return (
    <section className="mission-deck">
      <h2>Mission Overview</h2>
      <p>Role: {role}</p>
      <div className="deck-grid">
        {/* Strategic overlays and fleet status */}
      </div>
    </section>
  );
}