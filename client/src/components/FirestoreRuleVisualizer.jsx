import React from 'react';

const FirestoreRuleVisualizer = ({ rules }) => {
  return (
    <div className="mt-6 text-sm">
      <h2 className="text-lg font-bold mb-2">🧾 Firestore Rule Preview</h2>
      <pre className="bg-gray-100 p-4 rounded border text-xs overflow-x-auto">
{rules ?? `match /apps/{appId}/trips/{tripId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.driver_uid;
  allow write: if request.auth.token.role in ['admin', 'fleet_manager'];
}`}
      </pre>
    </div>
  );
};

export default FirestoreRuleVisualizer;