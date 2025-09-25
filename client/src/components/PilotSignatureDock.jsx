import React from 'react';
import SignatureCapture from './SignatureCapture';

export default function PilotSignatureDock({ onSigned }) {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold mb-2">✍️ Pilot Signature</h4>
      <SignatureCapture onSave={onSigned} />
    </div>
  );
}