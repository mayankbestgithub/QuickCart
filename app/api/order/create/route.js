import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { inngest } from "@/config/inngest";
import User from "@/models/User";
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();
    if (!address || items.length == 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid data",
      });
    }
    await connectDB();
    //calculate total amount
    const amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // await inngest.send({
    //   name: "order/created",
    //   data: {
    //     userId,
    //     address,
    //     items,
    //     amount: amount + Math.floor(amount * 0.02),
    //     date: Date.now(),

    //   },
    // });
    // to integrate strapi...
    await Order.create({
      userId,
      address,
      items,
      amount: amount + Math.floor(amount * 0.02),
      date: Date.now(),
      paymentType: "COD",
    });

    // clear user cart
    const user = await User.findById(userId);
    user.cartItems = {};
    await user.save();
    return NextResponse.json({
      success: true,
      message: "Order placed",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
