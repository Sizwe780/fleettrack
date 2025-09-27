// src/components/cockpit/FleetPersonaSwitch.jsx
import React from 'react';

export default function FleetPersonaSwitch({ role }) {
  const persona = {
    driver: 'Cargo Mode',
    dispatcher: 'Patrol Mode',
    admin: 'Emergency Mode',
    sovereign: 'Command Mode',
  };
  return <span className="persona-mode">Mode: {persona[role]}</span>;
}