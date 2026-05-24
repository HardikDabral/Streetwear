import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import Product from "@/libs/Models/Product";

const parseCsv = (v) =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

export async function GET(req) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();
    const categories = parseCsv(searchParams.get("category"));
    const sizes = parseCsv(searchParams.get("sizes"));
    const minPrice = Number(searchParams.get("minPrice")) || undefined;
    const maxPrice = Number(searchParams.get("maxPrice")) || undefined;
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(48, parseInt(searchParams.get("limit") || "12")));
    const excludeId = searchParams.get("exclude");

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }
    if (categories.length) filter.category = { $in: categories };
    if (sizes.length) filter.sizes = { $in: sizes };
    if (minPrice != null || maxPrice != null) {
      filter.price = {};
      if (minPrice != null) filter.price.$gte = minPrice;
      if (maxPrice != null) filter.price.$lte = maxPrice;
    }
    if (excludeId) filter._id = { $ne: excludeId };

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { _id: -1 },
      name_asc: { name: 1 },
    };
    const sortBy = sortMap[sort] || sortMap.newest;

    const [products, total, allCategoriesAgg] = await Promise.all([
      Product.find(filter)
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      Product.distinct("category"),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      facets: {
        categories: allCategoriesAgg.filter(Boolean),
      },
    });
  } catch (err) {
    console.error("list products error", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
