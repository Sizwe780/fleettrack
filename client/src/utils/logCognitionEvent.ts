import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
const db = getFirestore();

export async function logCognitionEvent(uid: string, type: string, value: any) {
  const eventId = `${uid}_${type}_${Date.now()}`;
  await setDoc(doc(db, 'cognitionEvents', eventId), {
    uid,
    type,
    value,
    timestamp: Timestamp.now(),
    remarks: `Event triggered via cockpit: ${type}`,
    linkedInvoice: null,
    exported: false
  });
}