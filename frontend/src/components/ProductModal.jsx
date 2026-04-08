import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { createProduct, updateProduct } from "../services/productService";

export default function ProductModal({ isOpen, onClose, productToEdit }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    expiryDate: "",
    reorderLevel: 10,
  });

  // Populate form when editing an existing product
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        category: productToEdit.category || "",
        quantity: productToEdit.quantity || 0,
        price: productToEdit.price || 0,
        expiryDate: productToEdit.expiryDate ? productToEdit.expiryDate.split("T")[0] : "", // format for date input
        reorderLevel: productToEdit.reorderLevel || 10,
      });
    } else {
      // Reset logic for Add Product
      setFormData({
        name: "",
        category: "",
        quantity: 0,
        price: 0,
        expiryDate: "",
        reorderLevel: 10,
      });
    }
  }, [productToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "price" || name === "reorderLevel" 
        ? Number(value) 
        : value,
    }));
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (productToEdit) {
      updateMutation.mutate({ id: productToEdit._id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {productToEdit ? "Edit Product" : "Add Product"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="" disabled>Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label>
                <input
                  type="number"
                  name="reorderLevel"
                  required
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? "Saving..." 
                  : productToEdit ? "Update" : "Add"}
              </button>
            </div>
            
            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-red-500 text-sm mt-2">
                An error occurred. Please try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
