// src/components/layout/TripTimelineVisualizer.jsx
import React from 'react';

export default function TripTimelineVisualizer({ timeline }) {
  return (
    <div className="trip-timeline">
      <h3>Trip Timeline</h3>
      {timeline.map((event, i) => (
        <div key={i} className="timeline-event">
          <strong>{event.time}</strong>: {event.description}
        </div>
      ))}
    </div>
  );
}