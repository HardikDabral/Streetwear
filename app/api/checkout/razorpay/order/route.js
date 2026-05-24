import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import User from "@/libs/Models/User";
import Product from "@/libs/Models/Product";
import Order from "@/libs/Models/Order";
import { getSessionPayload } from "@/app/lib/auth";
import { getRazorpay } from "@/app/lib/razorpay";

const SHIPPING_FREE_AT = 2000;
const SHIPPING_FEE = 99;

export async function POST(req) {
  try {
    const payload = await getSessionPayload();
    if (!payload?.sub) {
      return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 });
    }

    const { items, address } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!address?.fullName || !address?.phone || !address?.line1 || !address?.city || !address?.pincode) {
      return NextResponse.json(
        { error: "Please complete your shipping address" },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const user = await User.findById(payload.sub).select("email name");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Recompute totals server-side using current DB prices (don't trust client)
    const productIds = items.map((it) => it.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    let subtotal = 0;

    for (const it of items) {
      const p = productMap.get(String(it.productId));
      if (!p) {
        return NextResponse.json(
          { error: `Product not found: ${it.productId}` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.min(99, Number(it.quantity) || 1));
      subtotal += p.price * qty;
      orderItems.push({
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: qty,
        size: it.size || null,
        imgSrc: p.imgSrc?.[0] || "",
      });
    }

    const shipping = subtotal >= SHIPPING_FREE_AT ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    // Create Razorpay order
    let razorpayOrder;
    try {
      const rzp = await getRazorpay();
      razorpayOrder = await rzp.orders.create({
        amount: total * 100,
        currency: "INR",
        receipt: `kv_${Date.now()}`,
      });
    } catch (e) {
      console.error("razorpay create order failed", e);
      return NextResponse.json(
        { error: e.message || "Failed to create payment order" },
        { status: 500 }
      );
    }

    // Persist pending order
    const order = await Order.create({
      userId: user._id,
      email: user.email,
      items: orderItems,
      subtotal,
      shipping,
      total,
      address,
      payment: {
        provider: "razorpay",
        razorpayOrderId: razorpayOrder.id,
        status: "created",
      },
      status: "pending_payment",
    });

    return NextResponse.json({
      orderId: String(order._id),
      razorpay: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      summary: { subtotal, shipping, total },
      customer: { name: user.name || address.fullName, email: user.email, phone: address.phone },
    });
  } catch (err) {
    console.error("checkout order error", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
