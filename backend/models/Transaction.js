const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: ["ADD", "REDUCE"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // transaction size must be at least 1
    },
    reason: {
      type: String,
      required: true,
      enum: ["sale", "restock", "damaged", "expired", "initial"],
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
