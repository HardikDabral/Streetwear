const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    imgSrc: String,
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: String, default: "razorpay" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    address: { type: addressSchema, required: true },
    payment: { type: paymentSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "pending_payment",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ "payment.razorpayOrderId": 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
