export const predictSpoilage = ({ cargo }) => {
    return cargo.map(c => ({
      name: c.name,
      risk: c.temp > 8 || c.humidity > 70 ? 'High' : 'Low',
      recommendation: c.temp > 8 ? 'Activate cooling' : 'Stable',
    }));
  };