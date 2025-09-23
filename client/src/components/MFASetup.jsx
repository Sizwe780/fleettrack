import React, { useEffect, useState } from 'react';
import { getAuth, PhoneAuthProvider, multiFactor, RecaptchaVerifier } from 'firebase/auth';

export default function MFASetup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const auth = getAuth();

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => console.log('reCAPTCHA verified')
    }, auth);
  }, [auth]);

  const sendCode = async () => {
    const phoneProvider = new PhoneAuthProvider(auth);
    const id = await phoneProvider.verifyPhoneNumber(phoneNumber, window.recaptchaVerifier);
    setVerificationId(id);
  };

  const confirmCode = async () => {
    const cred = PhoneAuthProvider.credential(verificationId, code);
    await multiFactor(auth.currentUser).enroll(cred, 'Primary phone');
    console.log('✅ MFA enrolled');
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">🔐 MFA Setup</h2>
      <input type="tel" placeholder="+27..." value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
      <button onClick={sendCode} className="w-full bg-blue-600 text-white py-2 rounded">Send Verification Code</button>

      {verificationId && (
        <>
          <input type="text" placeholder="Enter code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full border rounded px-3 py-2 mt-4" />
          <button onClick={confirmCode} className="w-full bg-green-600 text-white py-2 rounded mt-2">Confirm & Enroll</button>
        </>
      )}

      <div id="recaptcha-container" />
    </div>
  );
}