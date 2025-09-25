export default function BreachForecaster({ trip }) {
    const { delayRisk = 0, fatigueRisk = 0, routeComplexity = 0 } = trip?.analysis || {};
    const breachScore = Math.round((delayRisk + fatigueRisk + routeComplexity) / 3);
  
    return (
      <div className="mb-4">
        <h3 className="font-semibold">🚨 Breach Forecast</h3>
        <p>Predicted breach risk: <strong>{breachScore}/10</strong></p>
      </div>
    );
  }