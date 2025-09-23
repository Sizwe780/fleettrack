export const saveTripDraft = (trip) => {
    const drafts = JSON.parse(localStorage.getItem('fleettrack_trip_drafts') || '[]');
    drafts.push(trip);
    localStorage.setItem('fleettrack_trip_drafts', JSON.stringify(drafts));
  };
  
  export const loadTripDrafts = () => {
    return JSON.parse(localStorage.getItem('fleettrack_trip_drafts') || '[]');
  };