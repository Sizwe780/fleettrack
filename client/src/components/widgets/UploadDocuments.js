// src/components/widgets/UploadDocuments.js
import React, { useState } from 'react';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const UploadDocuments = ({ user }) => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    const fileRef = ref(storage, `docs/${user.uid}/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);
    setUrl(downloadUrl);
    alert('Upload successful!');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border text-center">
      <h2 className="text-xl font-bold mb-4">Upload Document</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Upload
      </button>
      {url && <p className="mt-4 text-green-600">Download: <a href={url} target="_blank" rel="noreferrer">{file.name}</a></p>}
    </div>
  );
};

export default UploadDocuments;