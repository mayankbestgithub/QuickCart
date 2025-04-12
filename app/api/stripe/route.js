import connectDB from "@/config/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export async function POST(request) {
  try {
    const rawBody = await request.arrayBuffer();
    const sig = headers().get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId, userId } = session.data[0].metadata;
      await connectDB();
      if (isPaid) {
        await Order.findByIdAndUpdate(orderId, { isPaid: true });
        await User.findByIdAndUpdate(userId, { cartItems: {} });
      } else {
        await Order.findByIdAndDelete(orderId);
      }
    };
    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentIntent(event.data.object.id, true);
        break;
      }
      case "payment_intent.canceled": {
        await handlePaymentIntent(event.data.object.id, false);
        break;
      }
      default:
        console.error(event.type);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message });
  }
}
export const config = {
  api: { bodyParser: false },
};
