import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';

const DriverUpload = () => {
  const [file, setFile] = useState(null);
  const [tripId, setTripId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file || !tripId) return;
    setUploading(true);
    setSuccess(false);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const storageRef = ref(storage, `proofs/${tripId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await setDoc(doc(db, 'trip_proofs', tripId), {
        driver_uid: user.uid,
        fileName: file.name,
        fileUrl: url,
        timestamp: new Date().toISOString()
      }, { merge: true });

      setSuccess(true);
      setFile(null);
      setTripId('');
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">📸 Upload Delivery Proof</h2>

      <div className="space-y-4 bg-white p-4 rounded shadow">
        <input
          type="text"
          placeholder="Trip ID"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file || !tripId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Proof'}
        </button>

        {success && (
          <p className="text-green-600 text-sm mt-2">✅ Proof uploaded successfully!</p>
        )}
      </div>
    </div>
  );
};

export default DriverUpload;