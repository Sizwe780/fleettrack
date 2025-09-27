import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function FleetBillingDashboard({ userId }) {
  const [receipts, setReceipts] = useState([]);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const r = await getDocs(query(collection(db, "apps/fleet-track-app/receipts"), where("uid", "==", userId)));
      const c = await getDocs(query(collection(db, "apps/fleet-track-app/certificates"), where("signedBy", "==", userId)));
      setReceipts(r.docs.map(doc => doc.data()));
      setCerts(c.docs.map(doc => doc.data()));
    };
    fetchAll();
  }, [userId]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">💳 Fleet Billing Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BillingBlock title="🧾 Receipts" items={receipts} />
        <BillingBlock title="📜 Certificates" items={certs} />
      </div>
    </div>
  );
}

function BillingBlock({ title, items }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ul className="space-y-1 text-sm">
        {items.length === 0 ? <li className="text-gray-500">No entries found.</li> :
          items.map((item, i) => (
            <li key={i} className="flex justify-between items-center border-b py-1">
              <span>{item.receiptId || item.certId}</span>
              <span className="text-gray-500">{item.timestamp || item.issuedAt}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}