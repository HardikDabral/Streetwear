import { NextResponse } from "next/server";
import connectToMongoDB from "@/libs/connectMongo";
import Order from "@/libs/Models/Order";
import User from "@/libs/Models/User";
import { verifyWebhookSignature } from "@/app/lib/razorpay";

// Razorpay needs the raw body for signature verification.
// In App Router route handlers, req.text() returns the raw string.
export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("razorpay webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventType = event.event;
  const payment = event.payload?.payment?.entity;
  const orderEntity = event.payload?.order?.entity;
  const razorpayOrderId = payment?.order_id || orderEntity?.id;

  if (!razorpayOrderId) {
    // Nothing actionable — acknowledge so Razorpay stops retrying.
    return NextResponse.json({ received: true });
  }

  await connectToMongoDB();
  const order = await Order.findOne({
    "payment.razorpayOrderId": razorpayOrderId,
  });
  if (!order) {
    console.warn(`razorpay webhook: no order for ${razorpayOrderId}`);
    return NextResponse.json({ received: true });
  }

  // Idempotency — already in a terminal state.
  if (["paid", "processing", "shipped", "delivered"].includes(order.status)) {
    return NextResponse.json({ received: true });
  }

  if (eventType === "payment.captured" || eventType === "order.paid") {
    order.payment.razorpayPaymentId = payment?.id || order.payment.razorpayPaymentId;
    order.payment.status = "paid";
    order.status = "paid";
    await order.save();
    // Clear the user's cart since the order is confirmed
    await User.findByIdAndUpdate(order.userId, { cart: [] });
  } else if (eventType === "payment.failed") {
    order.payment.status = "failed";
    order.status = "cancelled";
    await order.save();
  }

  return NextResponse.json({ received: true });
}
