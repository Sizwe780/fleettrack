export const queueFailedTrip = (trip) => {
    const queue = JSON.parse(localStorage.getItem('fleettrack_retry_queue') || '[]');
    queue.push(trip);
    localStorage.setItem('fleettrack_retry_queue', JSON.stringify(queue));
  };
  
  export const retryQueuedTrips = async (uploadFn) => {
    const queue = JSON.parse(localStorage.getItem('fleettrack_retry_queue') || '[]');
    for (const trip of queue) {
      try {
        await uploadFn(trip);
      } catch (err) {
        console.warn('Retry failed:', err);
      }
    }
    localStorage.removeItem('fleettrack_retry_queue');
  };