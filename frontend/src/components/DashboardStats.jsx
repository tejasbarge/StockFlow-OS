import { useQuery } from "@tanstack/react-query";
import { getAllTransactions } from "../services/transactionService";
import { getPredictions } from "../services/analyticsService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Package, AlertCircle, DollarSign, Brain, TrendingDown, Layers, ShoppingCart } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardStats({ products }) {
  const { data: transactions } = useQuery({
    queryKey: ["allTransactions"],
    queryFn: getAllTransactions,
  });

  const { data: predictions } = useQuery({
    queryKey: ["predictions"],
    queryFn: getPredictions,
  });

  // Derived Stats
  const totalProducts = products?.length || 0;
  
  const totalValue = products?.reduce((sum, p) => sum + p.quantity * p.price, 0) || 0;
  
  const lowStockCount = products?.filter(p => p.quantity <= p.reorderLevel).length || 0;

  // Transaction Analytics
  const salesTransactions = (transactions || []).filter(
    (tx) => tx.type === "REDUCE" && tx.reason === "sale" && tx.productId
  );

  // 1. Total Sales Last 30 Days Card
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSalesValue = salesTransactions
    .filter(tx => new Date(tx.createdAt) >= thirtyDaysAgo)
    .reduce((sum, tx) => sum + tx.quantity * tx.productId.price, 0);

  // 2. Sales Trend Line Chart (Grouped by Date)
  const salesByDateMap = {};
  salesTransactions.forEach(tx => {
    const dateValue = new Date(tx.createdAt).toLocaleDateString();
    if (!salesByDateMap[dateValue]) {
      salesByDateMap[dateValue] = 0;
    }
    salesByDateMap[dateValue] += tx.quantity;
  });
  
  // Convert to array and sort chronologically
  const salesTrendData = Object.keys(salesByDateMap)
    .map(date => ({ date, sales: salesByDateMap[date] }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // 3. Top Selling Products Bar Chart
  const salesByProductMap = {};
  salesTransactions.forEach(tx => {
    const name = tx.productId.name;
    if (!salesByProductMap[name]) {
      salesByProductMap[name] = 0;
    }
    salesByProductMap[name] += tx.quantity;
  });

  const topSellingData = Object.keys(salesByProductMap)
    .map(name => ({ name, quantity: salesByProductMap[name] }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5); // top 5

  // 4. Inventory Distribution Pie Chart
  const categoryMap = {};
  (products || []).forEach(p => {
    if (!categoryMap[p.category]) categoryMap[p.category] = 0;
    categoryMap[p.category] += p.quantity;
  });
  const categoryData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: categoryMap[cat],
  }));

  // 5. Prediction Insights
  const slowMoving = predictions?.filter(p => p.status === "slow_moving") || [];
  const overstocked = predictions?.filter(p => p.status === "overstock") || [];
  const needReorder = predictions?.filter(p => p.status === "reorder" && p.reorderSuggestion > 0) || [];

  return (
    <div className="mb-8 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Package size={20} className="text-blue-500" />
            <span className="font-semibold text-sm uppercase tracking-wider">Total Items</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">{totalProducts}</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <DollarSign size={20} className="text-green-500" />
            <span className="font-semibold text-sm uppercase tracking-wider">Total Value</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">${totalValue.toFixed(2)}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <TrendingUp size={20} className="text-purple-500" />
            <span className="font-semibold text-sm uppercase tracking-wider">30-Day Sales</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">${recentSalesValue.toFixed(2)}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle size={64} className="text-red-500" />
          </div>
          <div className="flex items-center gap-3 text-red-600 mb-2 z-10">
            <AlertCircle size={20} />
            <span className="font-semibold text-sm uppercase tracking-wider">Low Stock</span>
          </div>
          <span className="text-3xl font-bold text-red-600 z-10">{lowStockCount}</span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 h-64 md:h-80">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4">Sales Trend (Units Sold)</h3>
          {salesTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-400">No sales data recorded yet.</div>
          )}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 h-64 md:h-80">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4">Top 5 Selling Products</h3>
          {topSellingData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingData} margin={{ top: 5, right: 0, bottom: 25, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="quantity" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No sales data recorded yet.</div>
          )}
        </div>
      </div>

      {/* Smart Insights Row */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Brain size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Smart Insights </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {/* Reorder Suggestions */}
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
             <div className="flex items-center gap-2 text-blue-700 font-bold mb-4">
                <ShoppingCart size={18} /> Required Reorders (7-Day)
             </div>
             {needReorder.length > 0 ? (
               <ul className="space-y-3">
                 {needReorder.slice(0, 5).map(p => (
                   <li key={p.product._id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                     <span className="font-medium text-gray-800 truncate pr-2">{p.product.name}</span>
                     <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-bold whitespace-nowrap">Buy +{p.reorderSuggestion}</span>
                   </li>
                 ))}
                 {needReorder.length > 5 && <li className="text-center text-sm text-blue-500 font-medium pt-2">+{needReorder.length - 5} more</li>}
               </ul>
             ) : (
                <div className="text-gray-500 text-sm italic">Stock levels are healthy for the next 7 days!</div>
             )}
          </div>

          {/* Overstock Warning */}
          <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100">
             <div className="flex items-center gap-2 text-orange-700 font-bold mb-4">
                <Layers size={18} /> Overstock Warnings
             </div>
             {overstocked.length > 0 ? (
               <ul className="space-y-3">
                 {overstocked.slice(0, 5).map(p => (
                   <li key={p.product._id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                     <span className="font-medium text-gray-800 truncate pr-2">{p.product.name}</span>
                     <span className="text-sm font-medium text-orange-600 whitespace-nowrap">Avg {p.dailyAvg.toFixed(1)}/day</span>
                   </li>
                 ))}
               </ul>
             ) : (
                <div className="text-gray-500 text-sm italic">No excessive overstock detected.</div>
             )}
          </div>

          {/* Slow Moving */}
          <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200">
             <div className="flex items-center gap-2 text-gray-600 font-bold mb-4">
                <TrendingDown size={18} /> Slow Moving (30 Days)
             </div>
             {slowMoving.length > 0 ? (
               <ul className="space-y-3">
                 {slowMoving.slice(0, 5).map(p => (
                   <li key={p.product._id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-100">
                     <span className="font-medium text-gray-600 truncate pr-2">{p.product.name}</span>
                     <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">0 Sales</span>
                   </li>
                 ))}
                 {slowMoving.length > 5 && <li className="text-center text-sm text-gray-400 font-medium pt-2">+{slowMoving.length - 5} more</li>}
               </ul>
             ) : (
                <div className="text-gray-500 text-sm italic">All products have active sales velocity!</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
