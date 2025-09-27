import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    price: "R0",
    features: ["Trip tracking", "Replay", "Dashboard"],
    locked: true
  },
  {
    name: "Starter",
    price: "R25/month",
    features: ["Fatigue estimator", "Incident reporter", "Clustering"],
    locked: false
  },
  {
    name: "Pro",
    price: "R99/month",
    features: ["Dispatch optimizer", "Audit trail", "Export preview"],
    locked: false
  },
  {
    name: "Enterprise",
    price: "R299/month",
    features: ["FleetQ cognition", "GenesisChain export", "FleetMarket access"],
    locked: false
  }
];

export default function SubscriptionManager() {
  const [userTier, setUserTier] = useState("Free");
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const fetchTier = async () => {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const tier = snap.data()?.membershipTier || "Free";
      setUserTier(tier);
      setLoading(false);
    };
    fetchTier();
  }, [uid]);

  const handleUpgrade = async tier => {
    // Replace with Stripe/Paystack checkout trigger
    alert(`Redirecting to payment for ${tier}...`);
    await updateDoc(doc(db, "users", uid), { membershipTier: tier });
    setUserTier(tier);
  };

  if (loading) return <p className="text-sm text-gray-500">Loading membership status...</p>;

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-indigo-700">Your FleetTrack ∞ Membership</h2>
        <p className="text-sm text-gray-600 mt-2">Current Tier: <strong>{userTier}</strong></p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map(tier => (
          <div
            key={tier.name}
            className={`bg-white rounded-2xl border border-gray-200 shadow-md p-6 flex flex-col justify-between ${
              userTier === tier.name ? "ring-2 ring-indigo-500" : ""
            }`}
          >
            <div>
              <h3 className="text-xl font-bold text-indigo-600 mb-2">{tier.name}</h3>
              <p className="text-lg font-semibold text-gray-800 mb-4">{tier.price}</p>
              <ul className="text-sm text-gray-700 space-y-2 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i}>• {feature}</li>
                ))}
              </ul>
            </div>
            {userTier === tier.name ? (
              <span className="text-xs text-green-600 font-semibold">✓ Active</span>
            ) : (
              <button
                onClick={() => handleUpgrade(tier.name)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Upgrade to {tier.name}
              </button>
            )}
          </div>
        ))}
      </section>

      <footer className="text-center text-xs text-gray-500 mt-12">
        All tiers include cockpit access and mutation safety. Enterprise unlocks cognition.
      </footer>
    </main>
  );
}