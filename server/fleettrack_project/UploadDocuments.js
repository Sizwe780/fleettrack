// src/components/widgets/UploadDocuments.js
import React, { useState } from 'react';
import { storage } from '../../firebase';
import { ref, uploadBytes } from 'firebase/storage';

const UploadDocuments = ({ user }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const fileRef = ref(storage, `docs/${user.uid}/${file.name}`);
    await uploadBytes(fileRef, file);
    alert('Upload successful');
  };

  return (
    <div className="upload-docs">
      <h2>Upload Documents</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadDocuments;