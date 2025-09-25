export const fetchTrafficIncidents = async (bbox) => {
    const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
    const url = `https://api.tomtom.com/traffic/services/4/incidents.json?bbox=${bbox}&key=${apiKey}`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.incidents ?? [];
    } catch (err) {
      console.error('Traffic incident fetch error:', err.message);
      return [];
    }
  };