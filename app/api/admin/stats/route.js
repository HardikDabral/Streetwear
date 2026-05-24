import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import Product from "@/libs/Models/Product";
import Order from "@/libs/Models/Order";
import User from "@/libs/Models/User";
import { requireAdminOrFail } from "@/app/lib/admin";

export async function GET() {
  const fail = await requireAdminOrFail();
  if (fail) return fail;
  await connectToMongoDB();
  const [productCount, orderCount, userCount, paidAgg, recentOrders] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ["paid", "processing", "shipped", "delivered"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id email total status createdAt items")
        .lean(),
    ]);

  return NextResponse.json({
    productCount,
    orderCount,
    userCount,
    revenue: paidAgg[0]?.total || 0,
    recentOrders: recentOrders.map((o) => ({ ...o, _id: String(o._id) })),
  });
}
