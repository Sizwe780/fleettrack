import React from 'react';

export function InventoryDashboard({ inventory }: { inventory: any[] }) {
  return (
    <div className="inventory-dashboard">
      <h3>📦 Parts Inventory</h3>
      <table>
        <thead>
          <tr><th>Part</th><th>Qty</th><th>Reorder</th></tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.partId}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.quantity < item.reorderThreshold ? '⚠️' : 'OK'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}