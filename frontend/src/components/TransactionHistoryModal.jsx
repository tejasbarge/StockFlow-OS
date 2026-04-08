import { useQuery } from "@tanstack/react-query";
import { X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getTransactionHistory } from "../services/transactionService";

export default function TransactionHistoryModal({ isOpen, onClose, product }) {
  const { data: history, isLoading, isError } = useQuery({
    queryKey: ["transactions", product?._id],
    queryFn: () => getTransactionHistory(product._id),
    enabled: !!product && isOpen, // Only fetch when open and product exists
  });

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            Stock History: <span className="text-blue-600 font-semibold">{product.name}</span>
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 font-medium">Loading history...</div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500 font-medium">Failed to load transaction history.</div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No stock transactions recorded yet.
            </div>
          ) : (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 uppercase">
                  <tr>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Quantity</th>
                    <th className="p-4 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {history.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {tx.type === "ADD" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-semibold text-xs">
                            <ArrowUpRight size={14} /> ADD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-semibold text-xs">
                            <ArrowDownRight size={14} /> REDUCE
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        {tx.type === "ADD" ? '+' : '-'}{tx.quantity}
                      </td>
                      <td className="p-4 text-gray-500 capitalize font-medium">
                        {tx.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
