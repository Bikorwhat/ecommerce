import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function PurchaseHistory() {
    const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }

        fetchPurchaseHistory();
    }, [isAuthenticated, isLoading, loginWithRedirect]);

    const fetchPurchaseHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get("/khalti/history/");
            setPurchases(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching purchase history:", err);
            setError("Failed to load purchase history");
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Loading...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">{error}</h2>
                <button
                    onClick={fetchPurchaseHistory}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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

            {purchases.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600">No purchases yet</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {purchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            className="border rounded-lg p-4 bg-white shadow-md"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Order #{purchase.purchase_order_id}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(purchase.purchase_date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-600">
                                        Rs. {purchase.total_amount}
                                    </p>
                                    <span
                                        className={`inline-block px-3 py-1 rounded text-sm ${purchase.status === "Completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {purchase.status}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-3">
                                <h4 className="font-semibold mb-2">Items:</h4>
                                <div className="space-y-2">
                                    {purchase.items && purchase.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center bg-gray-50 p-2 rounded"
                                        >
                                            <span>{item.name}</span>
                                            <span className="text-gray-600">
                                                Qty: {item.quantity} × Rs. {item.price} = Rs.{" "}
                                                {item.quantity * item.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PurchaseHistory;
