export default function RouteOptimizer({ trip }) {
    const { origin, destination, analysis } = trip;
    const altRoutes = analysis?.alternateRoutes || [];
  
    return (
      <div className="panel">
        <h2>🗺️ Route Optimizer</h2>
        {altRoutes.length > 0 ? (
          <ul>
            {altRoutes.map((r, i) => (
              <li key={i}>
                {r.name} — Delay Risk: {r.delayRisk}/10
                {r.delayRisk < analysis.delayRisk ? ' ✅ Recommended' : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p>No alternate routes available</p>
        )}
      </div>
    );
  }