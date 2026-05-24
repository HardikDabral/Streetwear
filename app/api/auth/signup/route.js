import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToMongoDB from "@/libs/connectMongo";
import User from "@/libs/Models/User";
import { setSessionCookie } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name || "",
    });

    await setSessionCookie(user._id);

    return NextResponse.json({
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
