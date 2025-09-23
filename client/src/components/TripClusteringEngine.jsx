export default function TripClusteringEngine({ trips }) {
    const clusters = {};
  
    trips.forEach(trip => {
      const key = `${trip.origin}-${trip.destination}`;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(trip);
    });
  
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">🧮 Trip Clusters</h3>
        <ul className="text-sm space-y-2">
          {Object.entries(clusters).map(([key, group], i) => (
            <li key={i}>
              {key}: {group.length} trips
            </li>
          ))}
        </ul>
      </div>
    );
  }