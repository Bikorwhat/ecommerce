import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { AuthContext } from "./AuthContext";

function PurchaseHistory() {
    const { isAuthenticated } = useContext(AuthContext);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            navigate("/");
            return;
        }

        fetchPurchaseHistory();
    }, [isAuthenticated, navigate]);

    const fetchPurchaseHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching purchase history...');
            const response = await api.get("/khalti/history/");
            console.log('Response:', response.data);

            setPurchases(response.data);
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.error || err.message || "Failed to load purchase history");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="text-gray-700 mb-4">{error}</p>
                <button
                    onClick={fetchPurchaseHistory}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Purchase History</h1>
                <button
                    onClick={() => navigate("/")}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Back to Shop
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600">Loading your purchases...</p>
                </div>
            ) : purchases.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600 mb-4">No purchases yet</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                                    Order #
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                                    Purchase Date
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                                    Total Amount
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase, index) => (
                                <tr key={purchase.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 text-sm text-gray-900 border-b">
                                        #{purchase.purchase_order_id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 border-b">
                                        {new Date(purchase.purchase_date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600 border-b">
                                        Rs. {purchase.total_amount}
                                    </td>
                                    <td className="px-6 py-4 text-sm border-b">
                                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${purchase.status === "Completed"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {purchase.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default PurchaseHistory;
