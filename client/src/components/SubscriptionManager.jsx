import React, { useState } from 'react';

export default function SubscriptionManager({ user }) {
  const [plan, setPlan] = useState(user.plan || 'Free');

  const upgrade = (newPlan) => setPlan(newPlan);

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">💳 Subscription Manager</h2>
      <p><strong>Current Plan:</strong> {plan}</p>
      <div className="space-x-2 mt-4">
        <button onClick={() => upgrade('Pro')} className="btn">Upgrade to Pro</button>
        <button onClick={() => upgrade('Enterprise')} className="btn">Upgrade to Enterprise</button>
      </div>
    </div>
  );
}