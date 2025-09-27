import React, { useEffect, useState } from "react";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function ExportDashboard({ userId }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const ref = collection(db, "apps/fleet-track-app/documents");
      const q = query(ref, where("uid", "==", userId), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
    };
    fetchDocuments();
  }, [userId]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">📁 Export Dashboard</h2>
      <p className="text-sm text-gray-600 mb-6">All printed and logged documents tied to your account.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">🆔 Doc ID</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Timestamp</th>
              <th className="px-4 py-2">Printed</th>
              <th className="px-4 py-2">Remarks</th>
              <th className="px-4 py-2">Preview</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} className="border-t">
                <td className="px-4 py-2 font-mono">{doc.docId}</td>
                <td className="px-4 py-2">{doc.type}</td>
                <td className="px-4 py-2">{new Date(doc.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">{doc.printed ? "✅" : "—"}</td>
                <td className="px-4 py-2">{doc.content?.remarks || "—"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => alert(JSON.stringify(doc.content, null, 2))}
                    className="text-indigo-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}