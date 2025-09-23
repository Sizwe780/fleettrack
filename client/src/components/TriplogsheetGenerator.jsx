import { format } from 'date-fns';

const TriplogsheetGenerator = (trip) => {
  const { id, driver_name, date, cycleUsed, origin, destination } = trip;
  const rawLogs = trip.analysis?.dailyLogs ?? [];
  const remarks = trip.analysis?.remarks?.split('.')?.filter(Boolean) ?? [];

  const location = `${origin} → ${destination}`;

  const normalizeSegments = (entries) => {
    // Example: ['08:00 Start', '12:00 Break', '18:00 End']
    const segments = [];
    for (let i = 0; i < entries.length - 1; i++) {
      const start = entries[i].split(' ')[0];
      const end = entries[i + 1].split(' ')[0];
      const status = entries[i].includes('Break') ? 'Off Duty'
                    : entries[i].includes('Start') ? 'On Duty'
                    : entries[i].includes('Restart') ? 'On Duty'
                    : entries[i].includes('Final') ? 'Driving'
                    : 'Driving';
      segments.push({ status, start, end });
    }
    return segments;
  };

  const logsheets = rawLogs.map((log, index) => ({
    day: log.day,
    driver_name,
    date: format(new Date(date), 'yyyy-MM-dd'),
    tripId: id,
    cycleUsed,
    location,
    remarks,
    segments: normalizeSegments(log.entries),
  }));

  return logsheets;
};

export default TriplogsheetGenerator;