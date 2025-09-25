export default function DispatchPredictor({ trip }) {
    const { delayRisk = 0, fatigueRisk = 0 } = trip?.analysis || {};
    const recommendedHour = fatigueRisk > 7 ? 6 : delayRisk > 7 ? 10 : 8;
  
    return (
      <div className="mb-4">
        <h3 className="font-semibold">🕒 Dispatch Prediction</h3>
        <p>Recommended dispatch time: <strong>{recommendedHour}:00</strong></p>
      </div>
    );
  }