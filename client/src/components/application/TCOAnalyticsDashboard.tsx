import React, { useEffect, useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { calculateTCO } from '../../utils/calculateTCO';
import { ExportTCOReport } from '../../components/application/ExportTCOReport';
import { TCOChart } from '../../components/application/TCOChart';
import { AssetReplacementForecast } from '../../components/application/AssetReplacementForecast';

export default function TCOAnalyticsDashboard() {
  const {
    fetchTrips,
    fetchInvoices,
    fetchPenalties,
    fetchDriverScores
  } = useFirestore();

  const [tcoData, setTcoData] = useState<any>(null);

  useEffect(() => {
    async function loadTCO() {
      const [trips, invoices, penalties, scores] = await Promise.all([
        fetchTrips(),
        fetchInvoices(),
        fetchPenalties(),
        fetchDriverScores()
      ]);
      const result = calculateTCO({ trips, invoices, penalties, driverScores: scores });
      setTcoData(result);
    }

    loadTCO();
  }, []);

  return (
    <div className="tco-dashboard p-6 space-y-6">
      <h2 className="text-xl font-bold text-indigo-700">📊 Total Cost of Ownership</h2>
      {tcoData && (
        <>
          <TCOChart data={tcoData} />
          <AssetReplacementForecast data={tcoData} />
          <ExportTCOReport data={tcoData} />
        </>
      )}
    </div>
  );
}