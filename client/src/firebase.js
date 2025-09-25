// Firebase Core SDK
import { initializeApp, getApps, getApp } from "firebase/app";

// Firebase Services
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  doc,
  updateDoc,
  onSnapshot,
  arrayUnion
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

// Services
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);
const storage = getStorage(app);

// 🔧 Intelligence Functions

export const updateLiveLocation = async (tripId, lat, lng) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    liveLocation: { lat, lng },
    updatedAt: new Date().toISOString()
  });
};

export const listenToLiveTrip = (tripId, callback) => {
  const tripRef = doc(db, "trips", tripId);
  return onSnapshot(tripRef, (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data());
  });
};

export const flagSLABreach = async (tripId) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    breachDetected: true,
    breachTime: new Date().toISOString()
  });
};

export const logTripIncident = async (tripId, incident) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    incidents: arrayUnion({
      ...incident,
      time: new Date().toISOString()
    })
  });
};

export const logTripVersion = async (tripId, changes, editor) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    versionHistory: arrayUnion({
      version: Date.now(),
      timestamp: new Date().toISOString(),
      changes,
      editor
    })
  });
};

export const lockTripSignature = async (tripId, signatureUrl) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    driverSignature: signatureUrl,
    signedAt: new Date().toISOString(),
    isLocked: true
  });
};

export const patchTripRiskAnalysis = async (tripId, analysis) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    analysis: {
      fuelRisk: analysis.fuelRisk,
      fatigueRisk: analysis.fatigueRisk,
      delayRisk: analysis.delayRisk
    }
  });
};

export const flagRouteDeviation = async (tripId, reason) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    deviationDetected: true,
    deviationReason: reason,
    deviationTime: new Date().toISOString()
  });
};

export const flagIdleTimeAnomaly = async (tripId, location, duration) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    idleAlerts: arrayUnion({
      location,
      duration,
      flaggedAt: new Date().toISOString()
    })
  });
};

export const flagMetadataIssue = async (tripId, issue) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    metadataFlags: arrayUnion({
      issue,
      flaggedAt: new Date().toISOString()
    })
  });
};

export const syncTripDispatchStatus = async (tripId, status) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    dispatchStatus: status,
    dispatchUpdatedAt: new Date().toISOString()
  });
};

export const assignTripVehicleDriver = async (tripId, vehicleId, driverName) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    vehicleId,
    driverName,
    assignedAt: new Date().toISOString()
  });
};

// Export all services and functions
export {
  app,
  analytics,
  db,
  auth,
  messaging,
  storage,
  updateLiveLocation,
  listenToLiveTrip,
  flagSLABreach,
  logTripIncident,
  logTripVersion,
  lockTripSignature,
  patchTripRiskAnalysis,
  flagRouteDeviation,
  flagIdleTimeAnomaly,
  flagMetadataIssue,
  syncTripDispatchStatus,
  assignTripVehicleDriver
};