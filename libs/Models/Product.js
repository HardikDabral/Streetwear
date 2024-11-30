const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  fileKeys: { type: [String], required: false }, // Optional field for storing file keys
  category: { type: String, required: true },
  imgSrc: { type: [String], required: true }, // Array of image URLs
  stock: { type: Number, required: true },
  sizes: { type: [String], required: false }, // Optional field for sizes
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
