import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { exportAsPDF } from "../utils/pdfExport";

export default function FleetBillingDashboard({ userId }) {
  const [receipts, setReceipts] = useState([]);
  const [certs, setCerts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedRef, setSelectedRef] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const r = await getDocs(query(collection(db, "apps/fleet-track-app/receipts"), where("uid", "==", userId)));
      const c = await getDocs(query(collection(db, "apps/fleet-track-app/certificates"), where("signedBy", "==", userId)));
      const i = await getDocs(query(collection(db, "apps/fleet-track-app/invoices"), where("issuedTo", "==", userId)));
      setReceipts(r.docs.map(doc => doc.data()));
      setCerts(c.docs.map(doc => doc.data()));
      setInvoices(i.docs.map(doc => doc.data()));
    };
    fetchAll();
  }, [userId]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">💳 Fleet Billing Dashboard</h2>
      <p className="text-sm text-gray-600 mb-6">All financial and compliance exports tied to your cockpit.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BillingBlock title="🧾 Receipts" items={receipts} onSelect={setSelectedRef} />
        <BillingBlock title="🧮 Invoices" items={invoices} onSelect={setSelectedRef} />
        <BillingBlock title="📜 Certificates" items={certs} onSelect={setSelectedRef} />
      </div>

      {selectedRef && (
        <div className="mt-6 bg-gray-50 border border-gray-300 rounded-xl p-4 text-xs">
          <pre>{JSON.stringify(selectedRef, null, 2)}</pre>
          <button
            onClick={() => exportAsPDF({ current: document.querySelector(".text-xs") }, "FleetTrack_Export.pdf")}
            className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}

function BillingBlock({ title, items, onSelect }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ul className="space-y-1 text-sm">
        {items.length === 0 ? <li className="text-gray-500">No entries found.</li> :
          items.map((item, i) => (
            <li key={i} className="flex justify-between items-center border-b py-1">
              <span>{item.receiptId || item.invoiceId || item.certId}</span>
              <button onClick={() => onSelect(item)} className="text-indigo-600 hover:underline">View</button>
            </li>
          ))}
      </ul>
    </div>
  );
}