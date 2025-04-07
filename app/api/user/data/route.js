import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import User from "@/models/User";
import { NextResponse } from "next/server";
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        sucess: false,
        message: "User not found",
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        imageURL: user.imageURL,
        role: user.role,
        cartItems: user.cartItems,
      },
    });
  } catch (err) {
    return NextResponse.json({
      sucess: false,
      message: err.message,
    });
  }
}
