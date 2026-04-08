const express = require("express");
const router = express.Router();
const {
  addStock,
  reduceStock,
  getTransactionHistory,
  getAllTransactions,
} = require("../controllers/transactionController");
const { protect } = require("../middlewares/authMiddleware");

// All transaction routes protected
router.use(protect);

router.get("/", getAllTransactions);
router.post("/add", addStock);
router.post("/reduce", reduceStock);
router.get("/:productId", getTransactionHistory);

module.exports = router;
