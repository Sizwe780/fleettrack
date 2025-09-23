import React from 'react';

const NotificationCenter = ({ notifications }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((note, i) => (
        <div key={i} className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded shadow-md text-sm">
          {note}
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;