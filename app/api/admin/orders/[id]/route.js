import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToMongoDB from "@/libs/connectMongo";
import Order from "@/libs/Models/Order";
import { requireAdminOrFail } from "@/app/lib/admin";

const ALLOWED_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function GET(_req, { params }) {
  const fail = await requireAdminOrFail();
  if (fail) return fail;
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectToMongoDB();
  const order = await Order.findById(id).lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order: { ...order, _id: String(order._id) } });
}

export async function PATCH(req, { params }) {
  const fail = await requireAdminOrFail();
  if (fail) return fail;
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { status, notes } = await req.json();
  const patch = {};
  if (status) {
    if (!ALLOWED_STATUSES.includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    patch.status = status;
  }
  if (typeof notes === "string") patch.notes = notes;

  await connectToMongoDB();
  const updated = await Order.findByIdAndUpdate(id, patch, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order: { ...updated, _id: String(updated._id) } });
}
