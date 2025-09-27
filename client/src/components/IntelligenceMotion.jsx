import React from 'react';

export default function IntelligenceMotion() {
  return (
    <div className="relative w-4 h-4">
      <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75"></div>
      <div className="absolute inset-0 rounded-full bg-indigo-600"></div>
    </div>
  );
}