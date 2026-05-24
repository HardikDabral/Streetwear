import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import Order from "@/libs/Models/Order";
import User from "@/libs/Models/User";
import { getSessionPayload } from "@/app/lib/auth";
import { verifyRazorpaySignature } from "@/app/lib/razorpay";

export async function POST(req) {
  try {
    const payload = await getSessionPayload();
    if (!payload?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing payment confirmation fields" },
        { status: 400 }
      );
    }

    const ok = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    await connectToMongoDB();

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpayOrderId,
      userId: payload.sub,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!ok) {
      order.payment.status = "failed";
      order.status = "cancelled";
      await order.save();
      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.status = "paid";
    order.status = "paid";
    await order.save();

    // Clear the user's cart after successful payment
    await User.findByIdAndUpdate(payload.sub, { cart: [] });

    return NextResponse.json({ ok: true, orderId: String(order._id) });
  } catch (err) {
    console.error("verify payment error", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
