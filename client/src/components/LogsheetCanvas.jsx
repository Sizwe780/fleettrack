// src/components/LogsheetCanvas.jsx
import React from 'react';

const blockColors = {
  driving: '#4ade80',     // green
  rest: '#facc15',        // yellow
  pickup: '#60a5fa',      // blue
  dropoff: '#f87171'      // red
};

export default function LogsheetCanvas({ logs }) {
  return (
    <div className="mt-4">
      {logs.map((log, i) => (
        <div key={i} className="mb-6">
          <h4 className="text-sm font-semibold mb-2">📅 {log.date}</h4>
          <svg width="100%" height="60" viewBox="0 0 960 60">
            {log.blocks.map((block, j) => {
              const startHour = parseInt(block.start.split(':')[0]) + parseInt(block.start.split(':')[1]) / 60;
              const endHour = parseInt(block.end.split(':')[0]) + parseInt(block.end.split(':')[1]) / 60;
              const x = (startHour / 24) * 960;
              const width = ((endHour - startHour) / 24) * 960;
              return (
                <rect
                  key={j}
                  x={x}
                  y={10}
                  width={width}
                  height={40}
                  fill={blockColors[block.type] || '#ccc'}
                >
                  <title>{block.type}: {block.start}–{block.end}</title>
                </rect>
              );
            })}
          </svg>
        </div>
      ))}
    </div>
  );
}