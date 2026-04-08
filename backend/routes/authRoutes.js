const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Route: POST /api/auth/register
router.post("/register", registerUser);

// Route: POST /api/auth/login
router.post("/login", loginUser);

// Route: GET /api/auth/profile
// Notice we use the `protect` middleware to ensure only logged-in users access this
router.get("/profile", protect, getUserProfile);

// Example of an Admin Only route:
// router.get("/admin-dashboard", protect, adminOnly, adminDashboardController);

module.exports = router;
