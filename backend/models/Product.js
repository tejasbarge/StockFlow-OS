const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Every product belongs to the user who created it
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0.0,
    },
    expiryDate: {
      type: Date,
      // Expiry dates are optional (not all products expire)
    },
    reorderLevel: {
      type: Number,
      required: true,
      default: 10,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
