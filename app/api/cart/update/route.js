import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { cartData } = await request.json();
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }
    user.cartItems = cartData;
    await user.save();
    return NextResponse.json({
      message: "Cart updated successfully",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ message: "User not found", success: false });
  }
}
