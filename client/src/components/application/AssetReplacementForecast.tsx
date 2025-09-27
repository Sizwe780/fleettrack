import React from 'react';

export function AssetReplacementForecast({ data }: { data: any }) {
  const threshold = 100000;
  const recommendation = data.totalCost > threshold ? 'Replace Asset' : 'Retain Asset';

  return (
    <div className="asset-forecast">
      <h3>🔮 Replacement Forecast</h3>
      <p>Total Cost: R{data.totalCost}</p>
      <p>Recommendation: <strong>{recommendation}</strong></p>
    </div>
  );
}