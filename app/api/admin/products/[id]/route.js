import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToMongoDB from "@/libs/connectMongo";
import Product from "@/libs/Models/Product";
import { requireAdminOrFail } from "@/app/lib/admin";

const isId = (id) => mongoose.Types.ObjectId.isValid(id);

export async function GET(_req, { params }) {
  const fail = await requireAdminOrFail();
  if (fail) return fail;
  const { id } = await params;
  if (!isId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectToMongoDB();
  const product = await Product.findById(id).lean();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: { ...product, _id: String(product._id) } });
}

export async function PUT(req, { params }) {
  try {
    const fail = await requireAdminOrFail();
    if (fail) return fail;
    const { id } = await params;
    if (!isId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json();
    await connectToMongoDB();

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        price: Number(body.price),
        category: body.category,
        imgSrc: Array.isArray(body.imgSrc) ? body.imgSrc : [],
        sizes: Array.isArray(body.sizes) ? body.sizes : [],
        stock: Number(body.stock) || 0,
      },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      product: { ...updated, _id: String(updated._id) },
    });
  } catch (err) {
    console.error("update product error", err);
    return NextResponse.json(
      { error: err.message || "Failed to update" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req, { params }) {
  const fail = await requireAdminOrFail();
  if (fail) return fail;
  const { id } = await params;
  if (!isId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectToMongoDB();
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
