import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import Order from "@/libs/Models/Order";
import { getSessionPayload } from "@/app/lib/auth";

export async function GET() {
  const payload = await getSessionPayload();
  if (!payload?.sub) {
    return NextResponse.json({ orders: [] });
  }
  await connectToMongoDB();
  const orders = await Order.find({ userId: payload.sub })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({
    orders: orders.map((o) => ({ ...o, _id: String(o._id) })),
  });
}
