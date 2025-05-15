const mongoose = require("mongoose");

// Schema for individual items in the cart
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  image: String,
  price: Number,
  size: String,
  color: String,
  quantity: {
    type: Number,
    default: 1,
  },
}, { _id: false }); // Optional: prevents Mongoose from adding _id to each subdocument

// Schema for the overall cart
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestId: {
      type: String,
    },
    products: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
