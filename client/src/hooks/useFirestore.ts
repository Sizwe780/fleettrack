import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    Timestamp
  } from 'firebase/firestore';
  
  const db = getFirestore();
  
  export function useFirestore() {
    // 🔍 Fetchers
    const fetchTrips = async () => {
      const snap = await getDocs(collection(db, 'trips'));
      return snap.docs.map(doc => doc.data());
    };
  
    const fetchInvoices = async () => {
      const snap = await getDocs(collection(db, 'invoices'));
      return snap.docs.map(doc => doc.data());
    };
  
    const fetchPenalties = async () => {
      const snap = await getDocs(collection(db, 'penalties'));
      return snap.docs.map(doc => doc.data());
    };
  
    const fetchDriverScores = async () => {
      const snap = await getDocs(collection(db, 'driverScores'));
      return snap.docs.map(doc => doc.data());
    };
  
    const fetchVehicles = async () => {
      const snap = await getDocs(collection(db, 'vehicles'));
      return snap.docs.map(doc => doc.data());
    };
  
    const fetchInventory = async () => {
      const snap = await getDocs(collection(db, 'inventory'));
      return snap.docs.map(doc => doc.data());
    };
  
    const fetchDispatch = async (uid: string) => {
      const ref = doc(db, 'trips', uid);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    };
  
    // 📝 Writers
    const saveDVIR = async (uid: string, data: any) => {
      const ref = doc(db, 'driverLogsheets', `${uid}_${Date.now()}`);
      await setDoc(ref, {
        uid,
        ...data,
        timestamp: Timestamp.now(),
        certId: `CERT-${uid}-${Date.now()}`,
        logoUrl: '/icon-192.png',
        remarks: 'DVIR submitted via DriverConsole',
        exported: false
      });
    };
  
    const scheduleMaintenance = async (vehicleId: string, date: string) => {
      const ref = doc(db, 'maintenanceSchedule', `${vehicleId}_${date}`);
      await setDoc(ref, {
        vehicleId,
        scheduledDate: date,
        timestamp: Timestamp.now(),
        certId: `CERT-${vehicleId}-${date}`,
        logoUrl: '/icon-192.png',
        remarks: 'Scheduled via MaintenanceScheduler',
        exported: false
      });
    };
  
    const saveWorkOrder = async (vehicleId: string, date: string, tasks: string[]) => {
      const ref = doc(db, 'workOrders', `${vehicleId}_${date}`);
      await setDoc(ref, {
        vehicleId,
        scheduledDate: date,
        tasks,
        timestamp: Timestamp.now(),
        certId: `CERT-${vehicleId}-${date}`,
        logoUrl: '/icon-192.png',
        remarks: 'Generated via generateWorkOrder',
        exported: false
      });
    };
  
    return {
      fetchTrips,
      fetchInvoices,
      fetchPenalties,
      fetchDriverScores,
      fetchVehicles,
      fetchInventory,
      fetchDispatch,
      saveDVIR,
      scheduleMaintenance,
      saveWorkOrder
    };
  }