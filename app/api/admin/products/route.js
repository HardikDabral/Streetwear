import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import Product from "@/libs/Models/Product";
import { requireAdminOrFail } from "@/app/lib/admin";

export async function GET(req) {
  const fail = await requireAdminOrFail();
  if (fail) return fail;
  await connectToMongoDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const filter = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
        ],
      }
    : {};
  const products = await Product.find(filter).sort({ _id: -1 }).lean();
  return NextResponse.json({
    products: products.map((p) => ({ ...p, _id: String(p._id) })),
  });
}

export async function POST(req) {
  try {
    const fail = await requireAdminOrFail();
    if (fail) return fail;
    await connectToMongoDB();
    const body = await req.json();

    const product = await Product.create({
      name: body.name,
      description: body.description,
      price: Number(body.price),
      category: body.category,
      imgSrc: Array.isArray(body.imgSrc) ? body.imgSrc : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
      stock: Number(body.stock) || 0,
      fileKeys: Array.isArray(body.fileKeys) ? body.fileKeys : [],
    });

    return NextResponse.json({
      product: { ...product.toObject(), _id: String(product._id) },
    });
  } catch (err) {
    console.error("create product error", err);
    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 400 }
    );
  }
}
