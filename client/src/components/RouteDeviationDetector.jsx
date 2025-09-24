export default function RouteDeviationDetector({ trip }) {
    const deviation = trip.analysis?.routeDeviation ?? 0;
    const threshold = 0.2; // 20% deviation
  
    return (
      deviation > threshold && (
        <div className="mt-2 text-sm text-red-600">
          🧭 <strong>Route Deviation:</strong> {Math.round(deviation * 100)}%
        </div>
      )
    );
  }