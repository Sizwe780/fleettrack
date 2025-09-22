// src/utils/callTripAnalysis.js
export const callTripAnalysis = async (formData) => {
    const response = await fetch('https://your-backend-url/api/calculate-trip/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  
    if (!response.ok) throw new Error('Trip analysis failed');
    return await response.json();
  };