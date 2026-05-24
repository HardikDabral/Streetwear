import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToMongoDB from "@/libs/connectMongo";
import User from "@/libs/Models/User";
import { setSessionCookie } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToMongoDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await setSessionCookie(user._id);

    return NextResponse.json({
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
