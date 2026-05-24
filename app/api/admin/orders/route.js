import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import Order from "@/libs/Models/Order";
import { requireAdminOrFail } from "@/app/lib/admin";

export async function GET(req) {
  const fail = await requireAdminOrFail();
  if (fail) return fail;
  await connectToMongoDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const filter = status ? { status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    orders: orders.map((o) => ({ ...o, _id: String(o._id) })),
  });
}
