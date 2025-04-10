import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();
    const origin = request.headers.get("origin");
    if (!address || items.length == 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid data",
      });
    }
    let productData = [];
    await connectDB();
    //calculate total amount
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);
    amount += Math.floor(amount * 0.02);
    // to integrate strapi...
    const order = await Order.create({
      userId,
      address,
      items,
      amount: amount,
      date: Date.now(),
      paymentType: "Stripe",
    });
    // create line items for stripe
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    });
    console.log(line_items);
    // create session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/order-placed`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });
    const url = session.url;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
