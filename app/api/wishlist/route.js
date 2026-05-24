import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import User from "@/libs/Models/User";
import { getSessionPayload } from "@/app/lib/auth";

export async function GET() {
  const payload = await getSessionPayload();
  if (!payload?.sub) return NextResponse.json({ wishlist: [] });

  await connectToMongoDB();
  const user = await User.findById(payload.sub).select("wishlist");
  return NextResponse.json({ wishlist: (user?.wishlist || []).map(String) });
}

export async function PUT(req) {
  const payload = await getSessionPayload();
  if (!payload?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wishlist } = await req.json();
  if (!Array.isArray(wishlist)) {
    return NextResponse.json({ error: "Invalid wishlist" }, { status: 400 });
  }

  const sanitized = [...new Set(wishlist.filter(Boolean).map(String))];

  await connectToMongoDB();
  await User.findByIdAndUpdate(payload.sub, { wishlist: sanitized });
  return NextResponse.json({ ok: true, wishlist: sanitized });
}
