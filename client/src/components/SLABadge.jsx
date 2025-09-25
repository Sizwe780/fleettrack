export default function SLABadge({ score }) {
    const color = score >= 90 ? 'emerald' : score >= 75 ? 'platinum' : 'charcoal';
    return (
      <span className={`px-2 py-1 rounded text-white bg-${color}`}>
        SLA: {score}%
      </span>
    );
  }