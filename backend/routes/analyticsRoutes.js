const express = require("express");
const router = express.Router();
const { getPredictions } = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/predictions", getPredictions);

module.exports = router;
