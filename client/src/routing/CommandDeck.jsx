// src/components/cockpit/CommandDeck.jsx
import React from 'react';
import MissionDeckView from './MissionDeckView';
import FleetPersonaSwitch from './FleetPersonaSwitch';

export default function CommandDeck({ userRole }) {
  return (
    <div className="command-deck">
      <header>
        <h1>FleetTrack XV – Command Deck</h1>
        <FleetPersonaSwitch role={userRole} />
      </header>
      <main>
        <MissionDeckView role={userRole} />
      </main>
    </div>
  );
}