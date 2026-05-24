import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import User from "@/libs/Models/User";
import { getSessionPayload } from "@/app/lib/auth";

export async function GET() {
  const payload = await getSessionPayload();
  if (!payload?.sub) return NextResponse.json({ cart: [] });

  await connectToMongoDB();
  const user = await User.findById(payload.sub).select("cart");
  return NextResponse.json({ cart: user?.cart || [] });
}

export async function PUT(req) {
  const payload = await getSessionPayload();
  if (!payload?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cart } = await req.json();
  if (!Array.isArray(cart)) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const sanitized = cart
    .filter((it) => it && it.productId)
    .map((it) => ({
      productId: it.productId,
      quantity: Math.max(1, Math.min(99, Number(it.quantity) || 1)),
      size: it.size || null,
    }));

  await connectToMongoDB();
  await User.findByIdAndUpdate(payload.sub, { cart: sanitized });
  return NextResponse.json({ ok: true, cart: sanitized });
}
