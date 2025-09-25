import React from 'react';

export default function ContactUs() {
  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📬 Contact Us</h2>
      <ul className="list-disc pl-5 text-sm space-y-2">
        <li><strong>Support:</strong> support@fleettrack.africa</li>
        <li><strong>Sales:</strong> sales@fleettrack.africa</li>
        <li><strong>Compliance:</strong> audit@fleettrack.africa</li>
        <li><strong>Feedback:</strong> feedback@fleettrack.africa</li>
      </ul>
    </div>
  );
}