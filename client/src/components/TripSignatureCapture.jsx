import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { lockTripSignature, storage } from '../firebase';

const TripSignatureCapture = ({ tripId }) => {
  const sigRef = useRef(null);
  const [signed, setSigned] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState('');

  const handleSave = async () => {
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
    const storageRef = ref(storage, `signatures/${tripId}.png`);
    await uploadString(storageRef, dataUrl, 'data_url');
    const url = await getDownloadURL(storageRef);
    await lockTripSignature(tripId, url);
    setSignatureUrl(url);
    setSigned(true);
  };

  const handleClear = () => {
    sigRef.current.clear();
    setSigned(false);
    setSignatureUrl('');
  };

  return (
    <div className="logsheet-section">
      <h2>Driver Signature</h2>
      {signed ? (
        <div>
          <img src={signatureUrl} alt="Driver Signature" style={{ maxHeight: '100px' }} />
          <p><em>Signature saved and trip locked.</em></p>
        </div>
      ) : (
        <>
          <SignatureCanvas
            penColor="black"
            canvasProps={{ width: 400, height: 120, className: 'signature-canvas' }}
            ref={sigRef}
          />
          <div className="mt-2">
            <button onClick={handleSave}>✅ Save Signature</button>
            <button onClick={handleClear}>🧹 Clear</button>
          </div>
        </>
      )}
    </div>
  );
};

export default TripSignatureCapture;