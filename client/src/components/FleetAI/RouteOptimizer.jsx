export default function RouteOptimizer({ trip }) {
    const { analysis } = trip || {};
    const altRoutes = analysis?.alternateRoutes || [];
  
    return (
      <div className="mb-4">
        <h3 className="font-semibold">🗺️ Route Optimizer</h3>
        {altRoutes.length > 0 ? (
          <ul className="list-disc ml-5">
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