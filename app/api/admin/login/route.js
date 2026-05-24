import { NextResponse } from "next/server";
import { setAdminCookie } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const { password } = await req.json();
    const expected = process.env.ADMIN_PASSWORD;

    if (!expected) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD is not configured on the server" },
        { status: 500 }
      );
    }
    if (!password || password !== expected) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await setAdminCookie();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin login error", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
