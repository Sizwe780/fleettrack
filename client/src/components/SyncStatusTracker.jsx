import React from 'react';

const SyncStatusTracker = ({ pendingCount }) => {
  if (pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded shadow-md text-sm z-50">
      ⏳ {pendingCount} trip{pendingCount > 1 ? 's' : ''} pending sync...
    </div>
  );
};

export default SyncStatusTracker;