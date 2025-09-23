import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const TripExportHistory = () => {
  const [exports, setExports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExports = async () => {
      try {
        const snap = await getDocs(collection(db, 'tripExports'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExports(data);
      } catch (err) {
        console.error('Export history fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExports();
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Trip Export History</h2>
      {isLoading ? (
        <p className="text-gray-500">Loading export logs...</p>
      ) : exports.length === 0 ? (
        <p className="text-gray-500">No exports found.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Trip ID</th>
              <th className="py-2">Exported By</th>
              <th className="py-2">Date</th>
              <th className="py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {exports.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="py-2">{log.tripId}</td>
                <td className="py-2">{log.exportedBy}</td>
                <td className="py-2">
                  {new Date(log.timestamp).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="py-2">{log.reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TripExportHistory;