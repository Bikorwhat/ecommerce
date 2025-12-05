import React, { useState } from "react";
import api from "./api";
import { useContext } from "react";
import { CartContext } from "./cartContext";
import { AuthContext } from "./AuthContext";

const Card = ({
  image,
  name,
  description,
  price,
  productId,
  category_name,
}) => {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);

  const handleBuy = async () => {

    if (qty < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated()) {
      alert("Please log in to proceed with payment");
      window.location.href = "http://127.0.0.1:8000/login";
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const totalAmount = price * qty;
      const orderId = productId || `${Date.now()}`;

      const items = [{
        name: name,
        quantity: qty,
        price: price
      }];

      const payload = {
        amount: totalAmount,
        purchase_order_id: orderId,
        purchase_order_name: `${name} × ${qty}`,
        items: items
      };

      const res = await api.post("/khalti/initiate/", payload);
      const { payment_url } = res.data;

      window.location.href = payment_url;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddtoCart = () => {
    const cartItem = {
      image,
      name,
      price,
      qty,
    };
    addToCart(cartItem);
    window.alert(name + " added to cart");
    console.log("Added to cart:", cartItem.name);
    setQty(1);
  };

  return (
    <div className="w-64 bg-white shadow-md rounded-xl p-3">
      <img src={image} className="w-full h-40 object-cover rounded-lg" alt={name} />
      {category_name && (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
          {category_name}
        </span>
      )}
      <h3 className="text-lg font-semibold mt-3">{name}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-blue-600 font-bold">Rs. {price}</p>

      <div className="text-black mt-2">
        Quantity:
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              setQty("");
            } else {
              setQty(Number(value));
            }
          }}
          onBlur={() => {
            if (qty === "" || qty < 1) setQty(1);
          }}
          className="w-16 ml-2 border rounded"
        />
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleBuy}
          disabled={loading}
          className="flex-1 bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600 transition disabled:opacity-70"
        >
          {loading ? "Processing…" : "Buy Now"}
        </button>

        <button
          onClick={handleAddtoCart}
          className="flex-1 bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Card;