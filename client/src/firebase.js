// Firebase Core SDK
import { initializeApp, getApps, getApp } from "firebase/app";

// Firebase Services
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  doc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  collection,
  getDocs,
  getDoc,
  addDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAla1ZaxyeLc9WBDvKbAS8I9hUZnxIWxPg",
  authDomain: "fleettrack-84eb6.firebaseapp.com",
  projectId: "fleettrack-84eb6",
  storageBucket: "fleettrack-84eb6.appspot.com",
  messagingSenderId: "918797565578",
  appId: "1:918797565578:web:8c8ee2b227057e21cbf773",
  measurementId: "G-EQT2H5SQ4V"
};

// Singleton Init
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Services (browser-only guards)
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// 🔧 Safe Firestore Ref
const safeDoc = (collectionName, id) =>
  typeof id === "string" && id.trim().length > 0 ? doc(db, collectionName, id) : null;

// 🔧 Trip Mutations
export const updateLiveLocation = async (tripId, lat, lng) => {
  const ref = safeDoc("trips", tripId);
  if (!ref || typeof lat !== "number" || typeof lng !== "number") return;
  await updateDoc(ref, {
    liveLocation: { lat, lng },
    updatedAt: new Date().toISOString()
  });
};

export const listenToLiveTrip = async (tripId, callback) => {
  const ref = safeDoc("trips", tripId);
  if (!ref || typeof callback !== "function") return;
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data());
  });
};

export const flagSLABreach = async (tripId) => {
  const ref = safeDoc("trips", tripId);
  if (!ref) return;
  await updateDoc(ref, {
    breachDetected: true,
    breachTime: new Date().toISOString()
  });
};

export const logTripIncident = async (tripId, incident) => {
  const ref = safeDoc("trips", tripId);
  if (!ref || typeof incident !== "object" || incident === null) return;
  await updateDoc(ref, {
    incidents: arrayUnion({ ...incident, time: new Date().toISOString() })
  });
};

export const logTripVersion = async (tripId, changes, editor) => {
  const ref = safeDoc("trips", tripId);
  if (
    !ref ||
    typeof changes !== "object" ||
    changes === null ||
    typeof editor !== "string" ||
    editor.trim().length === 0
  ) return;
  await updateDoc(ref, {
    versionHistory: arrayUnion({
      version: Date.now(),
      timestamp: new Date().toISOString(),
      changes,
      editor
    })
  });
};

export const lockTripSignature = async (tripId, signatureUrl) => {
  const ref = safeDoc("trips", tripId);
  if (!ref || typeof signatureUrl !== "string" || signatureUrl.trim().length === 0) return;
  await updateDoc(ref, {
    driverSignature: signatureUrl,
    signedAt: new Date().toISOString(),
    isLocked: true
  });
};

export const patchTripRiskAnalysis = async (tripId, analysis) => {
  const ref = safeDoc("trips", tripId);
  if (
    !ref ||
    typeof analysis?.fuelRisk !== "number" ||
    typeof analysis?.fatigueRisk !== "number" ||
    typeof analysis?.delayRisk !== "number"
  ) return;
  await updateDoc(ref, { analysis });
};

export const flagRouteDeviation = async (tripId, reason) => {
  const ref = safeDoc("trips", tripId);
  if (!ref || typeof reason !== "string" || reason.trim().length === 0) return;
  await updateDoc(ref, {
    deviationDetected: true,
    deviationReason: reason,
    deviationTime: new Date().toISOString()
  });
};

export const flagIdleTimeAnomaly = async (tripId, location, duration) => {
  const ref = safeDoc("trips", tripId);
  if (
    !ref ||
    typeof location !== "string" ||
    location.trim().length === 0 ||
    typeof duration !== "number"
  ) return;
  await updateDoc(ref, {
    idleAlerts: arrayUnion({
      location,
      duration,
      flaggedAt: new Date().toISOString()
    })
  });
};

export const flagMetadataIssue = async (tripId, issue) => {
  const ref = safeDoc("trips", tripId);
  if (!ref || typeof issue !== "string" || issue.trim().length === 0) return;
  await updateDoc(ref, {
    metadataFlags: arrayUnion({
      issue,
      flaggedAt: new Date().toISOString()
    })
  });
};

export const syncTripDispatchStatus = async (tripId, status) => {
  const ref = safeDoc("trips", tripId);
  if (!ref || typeof status !== "string" || status.trim().length === 0) return;
  await updateDoc(ref, {
    dispatchStatus: status,
    dispatchUpdatedAt: new Date().toISOString()
  });
};

export const assignTripVehicleDriver = async (tripId, vehicleId, driverName) => {
  const ref = safeDoc("trips", tripId);
  if (
    !ref ||
    typeof vehicleId !== "string" ||
    vehicleId.trim().length === 0 ||
    typeof driverName !== "string" ||
    driverName.trim().length === 0
  ) return;
  await updateDoc(ref, {
    vehicleId,
    driverName,
    assignedAt: new Date().toISOString()
  });
};

export const updateRole = async (uid, role) => {
  const ref = safeDoc("users", uid);
  if (!ref || typeof role !== "string" || role.trim().length === 0) return;
  await updateDoc(ref, { role });
};

export const logResponderAction = async (alertId, responderId, action) => {
  const ref = safeDoc("panicAlerts", alertId);
  if (
    !ref ||
    typeof responderId !== "string" ||
    responderId.trim().length === 0 ||
    typeof action !== "string" ||
    action.trim().length === 0
  ) return;
  await updateDoc(ref, {
    responderLog: arrayUnion({
      responderId,
      action,
      time: new Date().toISOString()
    })
  });
};

// 🖨️ Document Print Engine
export const generateUniqueDocId = async () => {
  const ref = collection(db, "apps/fleet-track-app/documents");
  const snapshot = await getDocs(ref);
  const count = snapshot.size;
  const padded = String(count + 1).padStart(6, "0");
  return `FT-${padded}`;
};

export const printDocument = async (uid, type, content) => {
  const docId = await generateUniqueDocId();
  const payload = {
    uid,
    type,
    createdAt: new Date().toISOString(),
    docId,
    content,
    printed: true,
    logoUrl: "https://fleettrack.app/assets/logo.png"
  };
  await addDoc(collection(db, "apps/fleet-track-app/documents"), payload);
  return payload;
};

// 💳 Stripe Receipt Sync
export const logStripeReceipt = async (uid, receipt) => {
  const payload = {
    uid,
    receiptId: receipt.id,
    amount: receipt.amount / 100,
    method: receipt.payment_method_details?.type || "card",
    timestamp: receipt.created,
    remarks: receipt.description || "—"
  };
  await addDoc(collection(db, "apps/fleet-track-app/receipts"), payload);
};

// 📜 Dispatch Certificate Generator
export const generateDispatchCertificate = async (tripId, signedBy, remarks) => {
  const tripRef = doc(db, "trips", tripId);
  const tripSnap = await getDoc(tripRef);
  if (!tripSnap.exists()) return;

  const certPayload = {
    certId: `CERT-${Date.now()}`,
    issuedFor: tripId,
    type: "Dispatch LogSheet",
    issuedAt: new Date().toISOString(),
    signedBy,
    remarks,
    metadata: tripSnap.data()
  };

  await addDoc(collection(db, "apps/fleet-track-app/certificates"), certPayload);
  return certPayload;
};