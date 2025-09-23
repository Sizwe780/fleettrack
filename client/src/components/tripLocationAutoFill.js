export const getCurrentLocation = (cb) => {
    if (!navigator.geolocation) return cb(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        cb(loc);
      },
      (err) => {
        console.warn('Location error:', err.message);
        cb(null);
      }
    );
  };