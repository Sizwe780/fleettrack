import React from 'react';

const STATUS_LINES = {
  'Off Duty': 20,
  'Sleeper Berth': 40,
  'Driving': 60,
  'On Duty': 80,
};

const HOURS = Array.from({ length: 25 }, (_, i) => i); // 0 to 24

const TripLogsheet = ({ log }) => {
  const { driver_name, date, tripId, cycleUsed, location, remarks, segments } = log;

  const timeToX = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h + m / 60) * 20; // 20px per hour
  };

  return (
    <div className="border p-4 rounded-xl bg-white shadow-md mb-6">
      <h2 className="text-lg font-bold mb-2">🧾 FleetTrack Logsheet</h2>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div><strong>Driver:</strong> {driver_name}</div>
        <div><strong>Date:</strong> {date}</div>
        <div><strong>Trip ID:</strong> {tripId}</div>
        <div><strong>Cycle Used:</strong> {cycleUsed} hrs</div>
        <div><strong>Location:</strong> {location}</div>
      </div>

      <svg width="500" height="120" className="border mb-4">
        {/* Horizontal lines for statuses */}
        {Object.entries(STATUS_LINES).map(([status, y]) => (
          <line key={status} x1="0" y1={y} x2="480" y2={y} stroke="#ccc" />
        ))}

        {/* Vertical hour markers */}
        {HOURS.map((h) => (
          <line key={h} x1={h * 20} y1="10" x2={h * 20} y2="90" stroke="#eee" />
        ))}

        {/* Duty status segments */}
        {segments.map((seg, i) => (
          <line
            key={i}
            x1={timeToX(seg.start)}
            y1={STATUS_LINES[seg.status]}
            x2={timeToX(seg.end)}
            y2={STATUS_LINES[seg.status]}
            stroke="black"
            strokeWidth="2"
          />
        ))}
      </svg>

      <div className="text-sm mb-2">
        <strong>Remarks:</strong>
        <ul className="list-disc ml-4">
          {remarks.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div className="mt-4 text-sm">
        <strong>Signature:</strong> ___________________________
      </div>
    </div>
  );
};

export default TripLogsheet;