import { useMemo } from 'react';
import HeatMap from './HeatMap'; // Your map component with heat layer

const FleetHeatmap = ({ trips }) => {
  const heatPoints = useMemo(() => {
    return trips
      .filter(t => t.geo?.lat && t.geo?.lng)
      .map(t => ({
        lat: t.geo.lat,
        lng: t.geo.lng,
        weight: t.healthScore ?? 50 // or use profit, violations, etc.
      }));
  }, [trips]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border mb-6">
      <h2 className="text-xl font-bold mb-2">Fleet Pulse Heatmap</h2>
      <HeatMap points={heatPoints} />
    </div>
  );
};

export default FleetHeatmap;