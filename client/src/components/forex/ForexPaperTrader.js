import React, { useEffect, useState } from "react";
import BanditReweighter from "../FleetCore/BanditReweighter";
import FleetCoreNeural from "../FleetCore/FleetCoreNeural";
import FleetCoreAudit from "../FleetCore/FleetCoreAudit";

export default function ForexPaperTrader() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const signal = FleetCoreNeural({ pair: "EUR/USD" });
    const adjusted = BanditReweighter(signal);

    const mockTrade = {
      pair: "EUR/USD",
      action: adjusted.adjustedConfidence > 0.6 ? "BUY" : "HOLD",
      amount: 1000,
      timestamp: Date.now(),
    };

    setTrades([mockTrade]);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Forex Paper Trader</h2>
      <ul className="text-sm text-gray-700">
        {trades.map((trade, idx) => (
          <li key={idx}>
            {trade.action} {trade.amount} of {trade.pair} @ {new Date(trade.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>
      <FleetCoreAudit data={trades} />
    </div>
  );
}