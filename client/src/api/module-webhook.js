import Stripe from "stripe";
import { db } from "./firebase";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const { uid, moduleId } = event.data.object.metadata;
    const ref = db.collection("users").doc(uid);
    await ref.update({
      purchases: FieldValue.arrayUnion(moduleId)
    });
  }

  res.status(200).send("Module purchase recorded");
}