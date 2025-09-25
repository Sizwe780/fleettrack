import React from 'react';
import SignatureCapture from './SignatureCapture';

export default function SignatureDock({ onSigned }) {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold mb-2">✍️ Commander Signature</h4>
      <SignatureCapture onSave={onSigned} />
    </div>
  );
}