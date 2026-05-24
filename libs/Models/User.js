const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    size: { type: String, default: null },
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

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    cart: { type: [cartItemSchema], default: [] },
    wishlist: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], default: [] },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
