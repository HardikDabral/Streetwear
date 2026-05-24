const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  fileKeys: { type: [String], required: false },
  category: { type: String, required: true },
  imgSrc: { type: [String], required: true },
  stock: { type: Number, required: true },
  sizes: { type: [String], required: false },
});

// Check if the model is already registered
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
