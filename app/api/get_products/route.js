import connectToMongoDB from "@/libs/connectMongo";
import Product from "@/libs/Models/Product";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    await connectToMongoDB();

    const data = await Product.find();
    console.log(data);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 400 }
    );
  }
}
