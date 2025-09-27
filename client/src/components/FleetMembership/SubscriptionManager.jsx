import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const tiers = [
  { name: "Starter", price: "R25/month", stripePriceId: "price_abc123" },
  { name: "Pro", price: "R99/month", stripePriceId: "price_def456" },
  { name: "Enterprise", price: "R299/month", stripePriceId: "price_xyz789" }
];

export default function SubscriptionManager() {
  const [userTier, setUserTier] = useState("Free");
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const fetchTier = async () => {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const tier = snap.data()?.membershipTier || "Free";
      setUserTier(tier);
    };
    fetchTier();
  }, [uid]);

  const handleUpgrade = async (tierName, stripePriceId) => {
    const stripe = await stripePromise;
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierName, stripePriceId, uid })
    });
    const session = await response.json();
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <h2 className="text-3xl font-bold text-indigo-700 text-center">Your FleetTrack ∞ Membership</h2>
      <p className="text-center text-sm text-gray-600">Current Tier: <strong>{userTier}</strong></p>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map(tier => (
          <div key={tier.name} className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
            <h3 className="text-xl font-bold text-indigo-600 mb-2">{tier.name}</h3>
            <p className="text-lg font-semibold text-gray-800 mb-4">{tier.price}</p>
            <button
              onClick={() => handleUpgrade(tier.name, tier.stripePriceId)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Upgrade to {tier.name}
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}