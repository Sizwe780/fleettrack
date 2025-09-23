export default function generateTripLogsheet(estimatedTime = '8h 45m', departureTime = '08:00') {
    const totalHours = parseFloat(estimatedTime.split('h')[0]) + (parseFloat(estimatedTime.split('m')[1]) || 0) / 60;
    const logs = [];
  
    let currentHour = parseInt(departureTime.split(':')[0]);
    let currentMinute = parseInt(departureTime.split(':')[1]);
    let remainingHours = totalHours;
  
    const pushBlock = (type, duration) => {
      const start = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      currentHour += Math.floor(duration);
      currentMinute += Math.round((duration % 1) * 60);
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
      const end = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      return { type, start, end };
    };
  
    const blocks = [];
  
    while (remainingHours > 0) {
      const driveBlock = Math.min(4, remainingHours);
      blocks.push(pushBlock('driving', driveBlock));
      remainingHours -= driveBlock;
  
      if (remainingHours > 0) {
        blocks.push(pushBlock('rest', 1));
        remainingHours -= 1;
      }
    }
  
    logs.push({
      date: new Date().toISOString().split('T')[0],
      blocks
    });
  
    return logs;
  }