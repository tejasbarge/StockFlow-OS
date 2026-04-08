const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middlewares/authMiddleware");

// All product routes strictly require the user to be logged in. 
// We use router.use() to protect all routes below in one line.
router.use(protect);

// Route: GET /api/products
// Route: POST /api/products
router.route("/").get(getProducts).post(createProduct);

// Route: PUT /api/products/:id
// Route: DELETE /api/products/:id
router.route("/:id").put(updateProduct).delete(deleteProduct);

module.exports = router;
