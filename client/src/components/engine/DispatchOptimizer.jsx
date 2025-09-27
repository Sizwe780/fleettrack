import React from 'react';
import { optimizeDispatch } from '../engines/engines';

export default function DispatchOptimizer({ drivers, vehicles, routes }) {
  const plan = optimizeDispatch(drivers, vehicles, routes);

  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-navy mb-2">🚚 AI Dispatch Optimizer</h3>
      <p className="text-sm text-gray-700 mb-2">Suggested Driver: <strong>{plan.driver}</strong></p>
      <p className="text-sm text-gray-700 mb-2">Suggested Vehicle: <strong>{plan.vehicle}</strong></p>
      <p className="text-sm text-gray-700 mb-2">Suggested Route: <strong>{plan.route}</strong></p>
    </section>
  );
}