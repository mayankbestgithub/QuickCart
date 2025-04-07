import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Address from "@/models/Address";
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address } = await request.json();
    await connectDB();
    const newAddress = await Address.create({
      ...address,
      userId,
    });
    return NextResponse.json({
      success: true,
      message: "Address added successfully",
       newAddress,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
