import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToMongoDB from "@/libs/connectMongo";
import Product from "@/libs/Models/Product";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }
    await connectToMongoDB();
    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    console.error("get product error", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
