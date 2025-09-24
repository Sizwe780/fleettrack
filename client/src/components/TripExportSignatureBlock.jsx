import React, { useState } from 'react';

export default function TripExportSignatureBlock({ trip }) {
  const [signedBy, setSignedBy] = useState('');
  const [signedAt, setSignedAt] = useState(null);

  const handleSign = () => {
    const timestamp = new Date().toISOString();
    setSignedAt(timestamp);
    alert(`Trip signed off by ${signedBy} at ${new Date(timestamp).toLocaleString()}`);
  };

  return (
    <div className="mt-6 border-t pt-4 text-sm">
      <h4 className="font-semibold mb-2">✍️ Export Signature Block</h4>

      <input
        type="text"
        placeholder="Your Name"
        value={signedBy}
        onChange={e => setSignedBy(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />

      <button
        onClick={handleSign}
        disabled={!signedBy}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Sign Off
      </button>

      {signedAt && (
        <div className="mt-3 text-xs text-gray-700">
          ✅ Signed by <strong>{signedBy}</strong> at {new Date(signedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}