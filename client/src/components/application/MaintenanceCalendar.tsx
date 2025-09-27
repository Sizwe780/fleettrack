import React from 'react';

export function MaintenanceCalendar({ onSchedule }: { onSchedule: (vehicleId: string, date: string) => void }) {
  const handleSchedule = () => {
    const vehicleId = prompt('Vehicle ID?');
    const date = prompt('Schedule Date (YYYY-MM-DD)?');
    if (vehicleId && date) onSchedule(vehicleId, date);
  };

  return (
    <div className="maintenance-calendar">
      <h3>🗓️ Schedule Maintenance</h3>
      <button onClick={handleSchedule}>Add Schedule</button>
    </div>
  );
}