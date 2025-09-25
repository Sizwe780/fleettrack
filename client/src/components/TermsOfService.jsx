import React from 'react';

export default function TermsOfService() {
  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📜 Terms of Service</h2>
      <p className="text-sm leading-relaxed">
        By using FleetTrack, you agree to operate within your assigned role, maintain audit integrity, and respect SLA boundaries. FleetTrack is not liable for third-party delays, tampering, or incomplete logsheets. All exports must be verified before submission to regulators or investors.
      </p>
    </div>
  );
}