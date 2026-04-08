const Product = require("../models/Product");

// @desc    Get all products for logged in user (with search and filter)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    // 1. We start by filtering products so users only see their own.
    const query = { user: req.user._id };

    // 2. Search Feature: If the request URL has "?search=laptop", we search the name using regex
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" }; // "i" makes it case-insensitive
    }

    // 3. Filter Feature: If "?category=electronics", we only return that category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Pass the built query to Mongoose
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { name, category, quantity, price, expiryDate, reorderLevel } = req.body;

    // Validate required fields
    if (!name || !category || quantity === undefined || price === undefined) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const product = await Product.create({
      user: req.user._id, // Attach the logged-in user's ID
      name,
      category,
      quantity,
      price,
      expiryDate,
      reorderLevel,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const { name, category, quantity, price, expiryDate, reorderLevel } = req.body;

    // Find the product by its ID from the URL
    const product = await Product.findById(req.params.id);

    // If product exists
    if (product) {
      // Security Check: Ensure the user trying to update it is the owner
      if (product.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized to update this product" });
      }

      // Update fields (use new value or fallback to existing value)
      product.name = name || product.name;
      product.category = category || product.category;
      product.quantity = quantity !== undefined ? quantity : product.quantity;
      product.price = price !== undefined ? price : product.price;
      product.expiryDate = expiryDate || product.expiryDate;
      product.reorderLevel = reorderLevel !== undefined ? reorderLevel : product.reorderLevel;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Security Check: Ensure owner
      if (product.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized to delete this product" });
      }

      await product.deleteOne();
      res.json({ message: "Product removed successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
