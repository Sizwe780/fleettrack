export default function BreachForecaster({ trip }) {
    const { delayRisk = 0, fatigueRisk = 0, routeComplexity = 0 } = trip.analysis || {};
    const breachScore = Math.round((delayRisk + fatigueRisk + routeComplexity) / 3);
  
    return (
      <div className="panel">
        <h2>🚨 Breach Forecast</h2>
        <p>Predicted breach risk: <strong>{breachScore}/10</strong></p>
        <p>{breachScore > 7 ? '⚠️ High breach probability—consider rerouting or early dispatch' :
           breachScore > 4 ? '⚠️ Moderate risk—monitor closely' :
           '✅ Low breach probability'}</p>
      </div>
    );
  }