const Transaction = require("../models/Transaction");
const Product = require("../models/Product");

// @desc    Add stock to a product
// @route   POST /api/transactions/add
// @access  Private
const addStock = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || !reason) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const qty = parseInt(quantity, 10);
    if (qty <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });

    // Verify product exists and belongs to user
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Update product quantity
    product.quantity += qty;
    await product.save();

    // Create Transaction Log
    const transaction = await Transaction.create({
      productId,
      userId: req.user._id,
      type: "ADD",
      quantity: qty,
      reason,
    });

    res.status(201).json({ product, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Reduce stock from a product
// @route   POST /api/transactions/reduce
// @access  Private
const reduceStock = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || !reason) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const qty = parseInt(quantity, 10);
    if (qty <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });

    // Verify product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Check if sufficient stock exists
    if (product.quantity < qty) {
      return res.status(400).json({ message: "Cannot reduce stock below 0" });
    }

    // Update product quantity
    product.quantity -= qty;
    await product.save();

    // Create Transaction Log
    const transaction = await Transaction.create({
      productId,
      userId: req.user._id,
      type: "REDUCE",
      quantity: qty,
      reason,
    });

    res.status(201).json({ product, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get full transaction history for a product
// @route   GET /api/transactions/:productId
// @access  Private
const getTransactionHistory = async (req, res) => {
  try {
    // Optionally verify ownership
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const history = await Transaction.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getAllTransactions = async (req, res) => {
  try {
    const history = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate("productId", "name category price");
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  addStock,
  reduceStock,
  getTransactionHistory,
  getAllTransactions,
};
