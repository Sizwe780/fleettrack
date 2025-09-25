import React from 'react';
import LiveTripTracker from './LiveTripTracker';
import LogsheetAutoFill from './LogsheetAutoFill';

export default function TripLivePanel({ tripId }) {
  return (
    <div className="mt-6">
      <LiveTripTracker tripId={tripId} />
      <LogsheetAutoFill tripId={tripId} />
    </div>
  );
}