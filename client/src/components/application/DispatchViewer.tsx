import React from 'react';

export function DispatchViewer({ dispatch }: { dispatch: any }) {
  if (!dispatch) return <p>Loading dispatch...</p>;

  return (
    <div className="dispatch-viewer">
      <h3>📦 Assigned Dispatch</h3>
      <p><strong>Route:</strong> {dispatch.route}</p>
      <p><strong>Start Time:</strong> {dispatch.dispatchTime}</p>
      <p><strong>Instructions:</strong> {dispatch.notes}</p>
    </div>
  );
}