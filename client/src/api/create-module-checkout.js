import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { moduleId, uid } = req.body;

  const prices = {
    QuantumRoutePredictor: "price_mod_001",
    ExportBlockSigner: "price_mod_002",
    FatigueRiskProfiler: "price_mod_003"
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: prices[moduleId], quantity: 1 }],
    mode: "payment",
    metadata: { uid, moduleId },
    success_url: `https://fleettrack.app/success?uid=${uid}&module=${moduleId}`,
    cancel_url: `https://fleettrack.app/cancel`
  });

  res.json({ id: session.id });
}