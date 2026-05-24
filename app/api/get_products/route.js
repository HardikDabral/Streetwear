import connectToMongoDB from "@/libs/connectMongo";
import Product from "@/libs/Models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Connecting to MongoDB...");
    await connectToMongoDB();

    console.log("Fetching products...");
    const data = await Product.find();
    console.log("Products fetched:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 400 }
    );
  }
}
