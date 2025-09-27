export default function WellnessOverlay({ fatigue, stress }) {
    const risk = fatigue > 70 || stress > 60 ? 'High' : 'Normal'
  
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
        <h3 className="text-lg font-bold">Wellness Status</h3>
        <p>Fatigue: {fatigue}%</p>
        <p>Stress: {stress}%</p>
        <p className={`font-bold ${risk === 'High' ? 'text-red-600' : 'text-green-600'}`}>Risk Level: {risk}</p>
      </div>
    )
  }