import React, { useEffect, useState } from "react";
import FleetCoreAudit from "../FleetCore/FleetCoreAudit";
import FleetCorePulse from "../FleetCore/FleetCorePulse";

export default function ForexExecution() {
  const [executionLog, setExecutionLog] = useState([]);
  const [pulseSignal, setPulseSignal] = useState(null);

  useEffect(() => {
    // Simulate fetching execution data
    const mockExecution = [
      { id: 1, pair: "USD/ZAR", action: "BUY", amount: 1000, timestamp: Date.now() },
      { id: 2, pair: "EUR/USD", action: "SELL", amount: 500, timestamp: Date.now() },
    ];
    setExecutionLog(mockExecution);

    // Simulate pulse signal
    const signal = FleetCorePulse({ pair: "USD/ZAR", confidence: 0.87 });
    setPulseSignal(signal);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Forex Execution Console</h2>

      {pulseSignal && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h3 className="font-semibold text-indigo-700">Pulse Signal</h3>
          <pre className="text-sm text-indigo-900">{JSON.stringify(pulseSignal, null, 2)}</pre>
        </div>
      )}

      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow">
        <h3 className="font-semibold text-gray-700 mb-2">Execution Log</h3>
        <ul className="space-y-2">
          {executionLog.map(entry => (
            <li key={entry.id} className="text-sm text-gray-800">
              {entry.action} {entry.amount} of {entry.pair} @ {new Date(entry.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>

      <FleetCoreAudit data={executionLog} />
    </div>
  );
}