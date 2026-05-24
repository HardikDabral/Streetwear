import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import User from "@/libs/Models/User";
import { getSessionPayload } from "@/app/lib/auth";

const shape = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  phone: user.phone,
  addresses: user.addresses || [],
});

export async function GET() {
  const payload = await getSessionPayload();
  if (!payload?.sub) {
    return NextResponse.json({ user: null });
  }

  await connectToMongoDB();
  const user = await User.findById(payload.sub).select(
    "email name phone addresses"
  );
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user: shape(user) });
}

export async function PATCH(req) {
  const payload = await getSessionPayload();
  if (!payload?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone } = await req.json();
  const patch = {};
  if (typeof name === "string") patch.name = name.trim();
  if (typeof phone === "string") patch.phone = phone.trim();

  await connectToMongoDB();
  const user = await User.findByIdAndUpdate(payload.sub, patch, {
    new: true,
  }).select("email name phone addresses");
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user: shape(user) });
}
