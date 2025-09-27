import React, { useEffect, useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { generateWorkOrder } from '../../utils/generateWorkOrder';
import { ExportWorkOrder } from '../../components/application/ExportWorkOrder';
import { VehicleList } from '../../components/application/VehicleList';
import { InventoryDashboard } from '../../components/application/InventoryDashboard';
import { MaintenanceCalendar } from '../../components/application/MaintenanceCalendar';

export default function MaintenanceScheduler(): JSX.Element {
  const { fetchVehicles, scheduleMaintenance, fetchInventory } = useFirestore();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    fetchVehicles().then(setVehicles);
    fetchInventory().then(setInventory);
  }, []);

  const handleSchedule = async (vehicleId: string, date: string) => {
    await scheduleMaintenance(vehicleId, date);
    await generateWorkOrder(vehicleId, date);
  };

  return (
    <div className="maintenance-scheduler p-6 space-y-6">
      <h2 className="text-xl font-bold text-indigo-700">🛠️ Workshop Scheduler</h2>
      <VehicleList vehicles={vehicles} />
      <InventoryDashboard inventory={inventory} />
      <MaintenanceCalendar onSchedule={handleSchedule} />
      <ExportWorkOrder />
    </div>
  );
}