import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import User from "@/libs/Models/User";
import { getSessionPayload } from "@/app/lib/auth";

const REQUIRED = ["fullName", "phone", "line1", "city", "state", "pincode"];

const sanitize = (a) => ({
  fullName: String(a.fullName || "").trim(),
  phone: String(a.phone || "").trim(),
  line1: String(a.line1 || "").trim(),
  line2: String(a.line2 || "").trim(),
  city: String(a.city || "").trim(),
  state: String(a.state || "").trim(),
  pincode: String(a.pincode || "").trim(),
  country: String(a.country || "India").trim(),
});

const validate = (a) => {
  for (const k of REQUIRED) if (!a[k]) return `Missing ${k}`;
  return null;
};

export async function GET() {
  const payload = await getSessionPayload();
  if (!payload?.sub) return NextResponse.json({ addresses: [] });
  await connectToMongoDB();
  const user = await User.findById(payload.sub).select("addresses");
  return NextResponse.json({ addresses: user?.addresses || [] });
}

export async function POST(req) {
  const payload = await getSessionPayload();
  if (!payload?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const address = sanitize(body);
  const err = validate(address);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  await connectToMongoDB();
  const user = await User.findByIdAndUpdate(
    payload.sub,
    { $push: { addresses: address } },
    { new: true }
  ).select("addresses");
  return NextResponse.json({ addresses: user.addresses });
}

// Replace the entire list (used for edits + deletes from the address book)
export async function PUT(req) {
  const payload = await getSessionPayload();
  if (!payload?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { addresses } = await req.json();
  if (!Array.isArray(addresses)) {
    return NextResponse.json({ error: "Invalid addresses" }, { status: 400 });
  }
  const cleaned = addresses.map(sanitize);
  for (const a of cleaned) {
    const err = validate(a);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }

  await connectToMongoDB();
  const user = await User.findByIdAndUpdate(
    payload.sub,
    { addresses: cleaned },
    { new: true }
  ).select("addresses");
  return NextResponse.json({ addresses: user.addresses });
}
