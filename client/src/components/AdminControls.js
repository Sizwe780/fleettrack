import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const AdminControls = ({ trip }) => {
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [newRemarks, setNewRemarks] = useState(trip.analysis?.remarks ?? '');

  const [editingCosts, setEditingCosts] = useState(false);
  const [newCosts, setNewCosts] = useState(trip.analysis?.profitability?.costs ?? {});

  const handleSave = async () => {
    const tripRef = doc(db, 'trips', trip.id);
    await updateDoc(tripRef, {
      'analysis.remarks': newRemarks,
      'analysis.profitability.costs': newCosts,
    });
    setEditingRemarks(false);
    setEditingCosts(false);
  };

  return (
    <div className="mt-6 bg-gray-100 p-4 rounded-md">
      <h3 className="text-lg font-bold mb-2">🛠️ Admin Controls</h3>

      {/* Editable Remarks */}
      <div className="mb-4">
        <label className="block font-semibold">Remarks:</label>
        {editingRemarks ? (
          <textarea
            className="w-full p-2 rounded-md"
            value={newRemarks}
            onChange={(e) => setNewRemarks(e.target.value)}
          />
        ) : (
          <p>{newRemarks}</p>
        )}
        <button
          onClick={() => setEditingRemarks(!editingRemarks)}
          className="mt-2 btn"
        >
          {editingRemarks ? 'Cancel' : 'Edit Remarks'}
        </button>
      </div>

      {/* Editable Costs */}
      <div>
        <label className="block font-semibold mb-1">Cost Breakdown:</label>
        {editingCosts ? (
          <div className="space-y-2">
            {Object.entries(newCosts).map(([key, value]) => (
              <div key={key} className="flex gap-2 items-center">
                <span className="w-32">{key}</span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    setNewCosts({ ...newCosts, [key]: Number(e.target.value) })
                  }
                  className="p-1 border rounded-md w-24"
                />
              </div>
            ))}
          </div>
        ) : (
          <ul className="list-disc list-inside text-gray-700">
            {Object.entries(newCosts).map(([key, value]) => (
              <li key={key}>
                {key}: R{value}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={() => setEditingCosts(!editingCosts)}
          className="mt-2 btn"
        >
          {editingCosts ? 'Cancel' : 'Edit Costs'}
        </button>
      </div>

      {/* Save Button */}
      {(editingRemarks || editingCosts) && (
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

export default AdminControls;