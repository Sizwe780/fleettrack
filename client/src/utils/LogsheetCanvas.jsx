import React from 'react';

const blockColors = {
  driving: '#4ade80',
  rest: '#facc15',
  pickup: '#60a5fa',
  dropoff: '#f87171',
};

export default function LogsheetCanvas({ logs }) {
  return (
    <div className="mt-4 space-y-6">
      {logs.map((log, i) => (
        <div key={i}>
          <h4 className="text-sm font-semibold mb-2">📅 {log.date}</h4>
          <svg width="100%" height="60" viewBox="0 0 960 60" preserveAspectRatio="xMinYMid meet">
            {log.blocks.map((block, j) => {
              const startHour = parseInt(block.start.split(':')[0]) + parseInt(block.start.split(':')[1]) / 60;
              const endHour = parseInt(block.end.split(':')[0]) + parseInt(block.end.split(':')[1]) / 60;
              const x = (startHour / 24) * 960;
              const width = ((endHour - startHour) / 24) * 960;
              const color = blockColors[block.type] || '#94a3b8'; // slate fallback

              return (
                <rect
                  key={j}
                  x={x}
                  y={10}
                  width={width}
                  height={40}
                  fill={color}
                >
                  <title>
                    {block.type.toUpperCase()} • {block.start}–{block.end} • {block.durationHours ?? '?'}h
                  </title>
                </rect>
              );
            })}
          </svg>

          {/* 🧪 Diagnostic Overlay */}
          <details className="bg-gray-50 p-3 rounded text-xs mt-2">
            <summary className="cursor-pointer font-semibold text-gray-700">📋 Logsheet Debug</summary>
            <pre className="overflow-x-auto mt-2">{JSON.stringify(log, null, 2)}</pre>
          </details>
        </div>
      ))}
    </div>
  );
}