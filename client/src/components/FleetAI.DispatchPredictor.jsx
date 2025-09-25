export default function DispatchPredictor({ trip }) {
    const { delayRisk = 0, fatigueRisk = 0 } = trip.analysis || {};
    const recommendedHour = fatigueRisk > 7 ? 6 : delayRisk > 7 ? 10 : 8;
  
    return (
      <div className="panel">
        <h2>🕒 Dispatch Prediction</h2>
        <p>Recommended dispatch time: <strong>{recommendedHour}:00</strong></p>
        <p>{fatigueRisk > 7 ? '⚠️ Early dispatch advised due to fatigue risk' :
           delayRisk > 7 ? '⚠️ Mid-morning dispatch advised to avoid congestion' :
           '✅ Standard dispatch window recommended'}</p>
      </div>
    );
  }