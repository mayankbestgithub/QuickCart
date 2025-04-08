import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import Order from "@/models/Order";
import Address from "@/models/Address";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    await connectDB();
    Address.length;
    Product.length;
    const orders = await Order.find({ userId: userId }).populate(
      "address items.product"
    );
    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
