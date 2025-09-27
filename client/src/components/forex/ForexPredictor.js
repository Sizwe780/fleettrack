import React, { useEffect, useState } from "react";
import FleetCoreNeural from "../FleetCore/FleetCoreNeural";
import EnsembleAggregator from "../FleetCore/EnsembleAggregator";
import BanditReweighter from "../FleetCore/BanditReweighter";
import FleetCoreAudit from "../FleetCore/FleetCoreAudit";
import FleetCorePersistence from "../FleetCore/FleetCorePersistence";
import FleetCorePulse from "../FleetCore/FleetCorePulse";

export default function ForexPredictor() {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const rawSignal = FleetCoreNeural({ pair: "USD/ZAR" });
    const reweighted = BanditReweighter(rawSignal);
    const ensemble = EnsembleAggregator([rawSignal, reweighted]);
    const pulse = FleetCorePulse({ pair: "USD/ZAR", confidence: ensemble.confidence });

    FleetCorePersistence(pulse);
    setPrediction(pulse);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Forex Predictor</h2>
      {prediction && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <pre className="text-sm text-blue-900">{JSON.stringify(prediction, null, 2)}</pre>
        </div>
      )}
      <FleetCoreAudit data={[prediction]} />
    </div>
  );
}

