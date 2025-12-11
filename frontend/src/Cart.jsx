import { useContext, useState } from "react";
import { CartContext } from "./cartContext";
import { AuthContext } from "./AuthContext";
import api from "./api";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function Cart() {
  const { cart, removeCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const cancelItem = (name) => {
    removeCart(name);
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const payout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    
  
    // Check if user is authenticated
    if (!isAuthenticated()) {
      alert("Please log in to proceed with payment");
      window.location.href =  `${API_BASE}/login`;
      return;
    }

    setIsLoading(true);

    try {
      const total = totalAmount;

      const items = cart.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.price
      }));

      const payload = {
        amount: total,
        customer_phone: "9800000000",
        items: items
      };

      const res = await api.post("/khalti/initiate/", payload);
      const { payment_url } = res.data;
      console.log("Redirecting to Khalti payment...");
      window.location.href = payment_url;
    } catch (err) {
      setIsLoading(false);
      console.error("Payment error:", err);

      if (err.response?.data?.error) {
        alert(`Payment error: ${err.response.data.error}`);
      } else {
        alert("Failed to start Khalti payment. Please try again.");
      }
    }
  };

  const clearAll = () => {
    if (window.confirm("All cart items will be removed. Are you sure?")) {
      cart.forEach(item => removeCart(item.name));
      console.log("Cart cleared");
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Your Cart</h2>

      {/* Empty Cart Button */}
      <div className="flex justify-end mt-2">
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded shadow-md transition-colors"
        >
          Empty Cart
        </button>
      </div>

      {cart.length === 0 ? (
        <p className="text-gray-500 mt-4">Your cart is empty</p>
      ) : (
        <>
          {cart.map((item, i) => (
            <div
              key={i}
              className="border p-2 mt-2 rounded flex sm:flex-row gap-2 items-start sm:items-center justify-between"
            >
              {i + 1 + "."}
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover flex-shrink-0"
              />
              <div className=" flex-1 flex-col lg:gap-7 lg:gap-5 font-bold">
                <p>Name: {item.name}</p>
                <p>Quantity: {item.qty}</p>
                <p>Price: Rs. {item.price}</p>
                <p>Total: Rs. {item.qty * item.price}</p>
              </div>

              <button
                className="mt-2 sm:mt-0 px-3 py-1 text-red-500 hover:text-red-700 border border-red-500 hover:border-red-700 rounded transition-colors flex-shrink-0"
                onClick={() => cancelItem(item.name)}
              >
                Remove
              </button>
            </div>
          ))}

          <h2 className="text-lg font-bold mt-4 flex justify-end">
            Total Amount: Rs. {totalAmount}
          </h2>

          <div className="flex justify-end mt-4">
            <button
              onClick={payout}
              disabled={isLoading}
              className={`px-6 py-2 rounded font-bold ${isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
