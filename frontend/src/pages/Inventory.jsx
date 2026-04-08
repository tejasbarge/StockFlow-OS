import { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Trash2, Edit, LogOut, History, PlusCircle, MinusCircle } from "lucide-react";
import { getProducts, deleteProduct } from "../services/productService";
import ProductModal from "../components/ProductModal";
import TransactionActionModal from "../components/TransactionActionModal";
import TransactionHistoryModal from "../components/TransactionHistoryModal";
import DashboardStats from "../components/DashboardStats";
import { AuthContext } from "../context/AuthContext";

export default function Inventory() {
  const queryClient = useQueryClient();
  const { logoutUser } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [activeTransactionProduct, setActiveTransactionProduct] = useState(null);
  const [actionType, setActionType] = useState("ADD");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Fetch products from backend via React Query
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products", searchTerm, category],
    queryFn: () => getProducts(searchTerm, category),
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenAction = (product, type) => {
    setActiveTransactionProduct(product);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const handleOpenHistory = (product) => {
    setActiveTransactionProduct(product);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">StockFlow OS</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 rounded-lg flex items-center gap-2 shadow-md transition-all text-sm md:text-base"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Product</span>
          </button>
          <button 
            onClick={logoutUser}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 md:px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm md:text-base"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {!isLoading && !isError && <DashboardStats products={products} />}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="food">Food</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load products. Check connection/login.</div>
        ) : products?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products found.</div>
        ) : (
          <>
            {/* Desktop Table — hidden on mobile */}
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Name</th>
                    <th className="p-4 font-semibold text-gray-600">Category</th>
                    <th className="p-4 font-semibold text-gray-600">Quantity</th>
                    <th className="p-4 font-semibold text-gray-600">Price</th>
                    <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800">{item.name}</td>
                      <td className="p-4 text-gray-500 capitalize">{item.category}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.quantity <= item.reorderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {item.quantity} in stock
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => handleOpenAction(item, "ADD")} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Add Stock"><PlusCircle size={18} /></button>
                        <button onClick={() => handleOpenAction(item, "REDUCE")} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Reduce Stock"><MinusCircle size={18} /></button>
                        <button onClick={() => handleOpenHistory(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View History"><History size={18} /></button>
                        <div className="w-px h-6 bg-gray-200 mt-1 mx-1"></div>
                        <button onClick={() => handleOpenEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Product"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Product"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout — hidden on desktop */}
            <div className="md:hidden divide-y divide-gray-100">
              {products.map((item) => (
                <div key={item._id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-base">{item.name}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{item.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold shrink-0 ${item.quantity <= item.reorderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.quantity} in stock
                    </span>
                  </div>
                  <p className="text-gray-600 font-medium text-sm mb-3">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => handleOpenAction(item, "ADD")} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 text-green-700 font-semibold rounded-lg border border-green-200">
                      <PlusCircle size={14} /> Add Stock
                    </button>
                    <button onClick={() => handleOpenAction(item, "REDUCE")} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-orange-50 text-orange-700 font-semibold rounded-lg border border-orange-200">
                      <MinusCircle size={14} /> Reduce
                    </button>
                    <button onClick={() => handleOpenHistory(item)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-200">
                      <History size={14} /> History
                    </button>
                    <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productToEdit={editingProduct} 
      />
      <TransactionActionModal 
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        product={activeTransactionProduct}
        type={actionType}
      />
      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        product={activeTransactionProduct}
      />
    </div>
  );
}
