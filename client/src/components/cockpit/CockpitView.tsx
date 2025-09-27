import React, { Fragment, useEffect, useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { calculateTCO } from '../../utils/calculateTCO';
import { logCognitionEvent } from '../../utils/logCognitionEvent';
import {
  createInvoice,
  syncStripeReceipt,
  triggerRefund
} from '../../utils/stripeBilling';
import { TCOChart } from '../../components/application/TCOChart';
import { AssetReplacementForecast } from '../../components/application/AssetReplacementForecast';
import { VehicleList } from '../../components/application/VehicleList';
import { InventoryDashboard } from '../../components/application/InventoryDashboard';
import { DispatchViewer } from '../../components/application/DispatchViewer';
import { CognitionTriggerPanel } from '../../components/application/CognitionTriggerPanel';
import { ExportTCOReport } from '../../components/application/ExportTCOReport';
import { ExportLogsheet } from '../../components/application/ExportLogsheet';
import { ExportWorkOrder } from '../../components/application/ExportWorkOrder';

export default function CockpitView({ uid }: { uid: string }) {
  const {
    fetchTrips,
    fetchInvoices,
    fetchPenalties,
    fetchDriverScores,
    fetchVehicles,
    fetchInventory,
    fetchDispatch
  } = useFirestore();

  const [tcoData, setTcoData] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [dispatch, setDispatch] = useState<any>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTCO() {
      const [trips, invoices, penalties, scores] = await Promise.all([
        fetchTrips(),
        fetchInvoices(),
        fetchPenalties(),
        fetchDriverScores()
      ]);
      setTcoData(calculateTCO({ trips, invoices, penalties, driverScores: scores }));
    }

    async function loadAssets() {
      const [vList, iList] = await Promise.all([
        fetchVehicles(),
        fetchInventory()
      ]);
      setVehicles(vList);
      setInventory(iList);
    }

    async function loadDispatch() {
      const d = await fetchDispatch(uid);
      setDispatch(d);
    }

    loadTCO();
    loadAssets();
    loadDispatch();
  }, [uid]);

  const handleCognitionTrigger = async (type: string, value: number) => {
    await logCognitionEvent(uid, type, value);
    const newInvoiceId = await createInvoice(uid, [{ type: 'cognition', amount: 150 }]);
    setInvoiceId(newInvoiceId);
  };

  const handleSyncReceipt = async () => {
    if (invoiceId) {
      await syncStripeReceipt(invoiceId, `TX-${Date.now()}`, 150);
    }
  };

  const handleRefund = async () => {
    if (invoiceId) {
      await triggerRefund(`TX-${Date.now()}`, 'Driver escalation dispute');
    }
  };

  return (
    <div className="cockpit-view">
      <h2>🧠 FleetTrack ∞ Surveillance Cockpit</h2>

      {tcoData && (
        <Fragment>
          <TCOChart data={tcoData} />
          <AssetReplacementForecast data={tcoData} />
          <ExportTCOReport data={tcoData} />
        </Fragment>
      )}

      <VehicleList vehicles={vehicles} />
      <InventoryDashboard inventory={inventory} />
      <DispatchViewer dispatch={dispatch} />
      <ExportLogsheet uid={uid} />
      <ExportWorkOrder />

      <CognitionTriggerPanel onTrigger={handleCognitionTrigger} />

      <div className="billing-controls">
        <button onClick={handleSyncReceipt}>💳 Sync Stripe Receipt</button>
        <button onClick={handleRefund}>🛡️ Trigger Refund</button>
      </div>
    </div>
  );
}