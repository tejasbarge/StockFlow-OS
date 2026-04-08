import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { addStock, reduceStock } from "../services/transactionService";

export default function TransactionActionModal({ isOpen, onClose, product, type }) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setQuantity("");
      setReason(type === "ADD" ? "restock" : "sale");
      setErrorText("");
    }
  }, [isOpen, type]);

  const actionMutation = useMutation({
    mutationFn: type === "ADD" ? addStock : reduceStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", product?._id] });
      queryClient.invalidateQueries({ queryKey: ["allTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      onClose();
    },
    onError: (err) => {
      setErrorText(err.response?.data?.message || "Transaction failed");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product) return;
    
    actionMutation.mutate({
      productId: product._id,
      quantity: Number(quantity),
      reason,
    });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
          <X size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 h-6 border-b border-gray-100 pb-2">
            {type === "ADD" ? "Add Stock" : "Reduce Stock"} - {product.name}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Reason *</label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {type === "ADD" ? (
                  <>
                    <option value="restock">Restock</option>
                    <option value="initial">Initial Inventory</option>
                  </>
                ) : (
                  <>
                    <option value="sale">Sale</option>
                    <option value="damaged">Damaged</option>
                    <option value="expired">Expired</option>
                  </>
                )}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionMutation.isPending}
                className={`px-4 py-2 font-medium text-white rounded-lg transition disabled:opacity-50 ${
                  type === "ADD" ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionMutation.isPending ? "Processing..." : "Confirm"}
              </button>
            </div>
            
            {errorText && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">
                {errorText}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
