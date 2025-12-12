import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "./api";
import { CartContext } from "./cartContext";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pidx = searchParams.get("pidx");
  const { cart, setCart } = useContext(CartContext);

  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!pidx) {
      setStatus("error");
      return;
    }

    verifyPayment();
  }, [pidx]);

  const verifyPayment = async () => {
    try {
      console.log('Cart contents:', cart);

      // Prepare items from cart
      const items = cart.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.price
      }));

      console.log('Items being sent to verify:', items);

      const response = await api.post("/khalti/verify/", {
        pidx: pidx,
        items: items
      });

      if (response.data.status === "Completed") {
        setStatus("success");
        setData(response.data);

        // Clear cart after successful payment
        localStorage.removeItem('cart');
        if (setCart) {
          setCart([]);
        }

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setStatus("failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("error");
    }
  };

  if (status === "loading") return <h2 className="p-8 text-center text-2xl">Verifying Payment...</h2>;
  if (status === "error") return <h2 className="p-8 text-center text-2xl text-red-600">Error: Invalid Payment</h2>;
  if (status === "failed") return <h2 className="p-8 text-center text-2xl text-red-600">Payment Failed</h2>;

  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 Payment Successful!</h1>

      <p className="text-xl mb-2"><b>Amount:</b> Rs {data.total_amount / 100}</p>
      <p className="text-gray-600 mb-6">Redirecting to home page...</p>

      <button
        onClick={() => navigate("/")}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Go Back Home Now
      </button>
    </div>
  );
}

export default PaymentSuccess;

