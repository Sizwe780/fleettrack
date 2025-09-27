import React, { useEffect, useState } from "react";
import ResearchReportPersistence from "./ResearchReportPersistence";
import FleetCoreAudit from "../FleetCore/FleetCoreAudit";
import FleetCorePulse from "../FleetCore/FleetCorePulse";
import FleetCorePersistence from "../FleetCore/FleetCorePersistence";

export default function ResearchReportGenerator() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const pulse = FleetCorePulse({ pair: "GBP/USD", confidence: 0.78 });
    FleetCorePersistence(pulse);
    ResearchReportPersistence(pulse);
    setReport(pulse);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Research Report Generator</h2>
      {report && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <pre className="text-sm text-green-900">{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
      <FleetCoreAudit data={[report]} />
    </div>
  );
}