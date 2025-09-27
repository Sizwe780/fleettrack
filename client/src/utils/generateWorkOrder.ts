import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
const db = getFirestore();

export async function generateWorkOrder(vehicleId: string, date: string) {
  const workOrderId = `${vehicleId}_${date}`;
  await setDoc(doc(db, 'workOrders', workOrderId), {
    vehicleId,
    scheduledDate: Timestamp.fromDate(new Date(date)),
    technicianId: null,
    partsUsed: [],
    status: 'pending',
    remarks: 'Generated via MaintenanceScheduler',
    certId: `WO-${vehicleId}-${date}`,
    exported: false
  });
}