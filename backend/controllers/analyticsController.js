const Product = require("../models/Product");
const Transaction = require("../models/Transaction");

// @desc    Get moving average predictions
// @route   GET /api/analytics/predictions
// @access  Private
const getPredictions = async (req, res) => {
  try {
    // 1. Fetch products
    const products = await Product.find({ user: req.user._id });
    
    // 2. Fetch last 30 days of sales transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sales = await Transaction.find({
      userId: req.user._id,
      type: "REDUCE",
      reason: "sale",
      createdAt: { $gte: thirtyDaysAgo }
    });

    // 3. Group sales by product
    const salesMap = {};
    sales.forEach(tx => {
      const prodStr = tx.productId.toString();
      if (!salesMap[prodStr]) salesMap[prodStr] = 0;
      salesMap[prodStr] += tx.quantity;
    });

    // 4. Calculate predictions
    const predictions = products.map((product) => {
      const total30d = salesMap[product._id.toString()] || 0;
      const dailyAvg = total30d / 30;
      const predictedDemand = Math.ceil(dailyAvg * 7); // Project for 7 days
      
      let status = "normal";
      if (total30d === 0) {
        status = "slow_moving";
      } else if (product.quantity > (predictedDemand * 2)) {
        status = "overstock";
      } else if (product.quantity <= predictedDemand) {
        status = "reorder";
      }

      return {
        product: product,
        total30d,
        dailyAvg,
        predictedDemand,
        status,
        reorderSuggestion: Math.max(0, predictedDemand - product.quantity)
      };
    });

    res.json(predictions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getPredictions,
};
