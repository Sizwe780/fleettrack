import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
const db = getFirestore();

export async function createInvoice(uid: string, items: { type: string, amount: number }[]) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const invoiceId = `INV-${uid}-${Date.now()}`;

  await setDoc(doc(db, 'invoices', invoiceId), {
    invoiceId,
    uid,
    items,
    total,
    issuedAt: Timestamp.now(),
    remarks: 'Auto-generated from cockpit module',
    certId: `CERT-${invoiceId}`,
    exported: false
  });

  return invoiceId;
}

export async function syncStripeReceipt(invoiceId: string, stripeTransactionId: string, amount: number) {
  await setDoc(doc(db, 'receipts', stripeTransactionId), {
    receiptId: stripeTransactionId,
    invoiceId,
    stripeTransactionId,
    amount,
    timestamp: Timestamp.now(),
    refundEligible: true
  });
}

export async function triggerRefund(receiptId: string, reason: string) {
  await setDoc(doc(db, 'refunds', receiptId), {
    receiptId,
    reason,
    timestamp: Timestamp.now(),
    status: 'processed'
  });
}