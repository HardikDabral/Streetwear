import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToMongoDB from "@/libs/connectMongo";
import Order from "@/libs/Models/Order";
import { getSessionPayload } from "@/app/lib/auth";

export async function GET(_req, { params }) {
  const payload = await getSessionPayload();
  if (!payload?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }
  await connectToMongoDB();
  const order = await Order.findOne({ _id: id, userId: payload.sub }).lean();
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ order: { ...order, _id: String(order._id) } });
}
