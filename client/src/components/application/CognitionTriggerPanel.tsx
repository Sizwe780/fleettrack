import React from 'react';

export function CognitionTriggerPanel({ onTrigger }: { onTrigger: (type: string, value: number) => void }) {
  const triggerTypes = ['fatigue', 'deviation', 'escalation'];

  return (
    <div className="cognition-trigger-panel">
      <h3>⚠️ Trigger Cognition Event</h3>
      {triggerTypes.map((type) => (
        <button key={type} onClick={() => onTrigger(type, Math.random())}>
          Trigger {type}
        </button>
      ))}
    </div>
  );
}