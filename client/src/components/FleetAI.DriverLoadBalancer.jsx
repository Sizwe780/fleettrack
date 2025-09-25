export default function DriverLoadBalancer({ drivers }) {
    const ranked = drivers.map(d => {
      const fatigue = d.fatigueScore || 0;
      const breaches = d.breachCount || 0;
      const dispatches = d.dispatchCount || 0;
      const loadScore = fatigue + breaches + dispatches;
      return { name: d.name, loadScore };
    }).sort((a, b) => b.loadScore - a.loadScore);
  
    return (
      <div className="panel">
        <h2>🧑‍💼 Driver Load Balancer</h2>
        <ul>
          {ranked.map((d, i) => (
            <li key={i}>{d.name} — Load Score: {d.loadScore}</li>
          ))}
        </ul>
      </div>
    );
  }