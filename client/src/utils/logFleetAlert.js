const logFleetAlert = (message, level = "info") => {
    const timestamp = new Date().toISOString();
    console[level](`[FleetAlert] ${timestamp}: ${message}`);
    // Optional: push to Firestore or overlay system
  };
  
  export default logFleetAlert;