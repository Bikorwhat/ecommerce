import { useState, useEffect } from 'react'
import CardList from './CardList.jsx'
import Header from './Header.jsx'
import PaymentSuccess from './payment.jsx'
import { Routes, Route } from 'react-router-dom'
import Cart from './Cart.jsx'
import { CartContext } from './cartContext'
import SearchPage from './SearchPage.jsx'
import CallbackHandler from './CallbackHandler.jsx'

function App() {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.name === item.name);

      if (exists) {
        return prev.map((p) =>
          p.name === item.name ? { ...p, qty: p.qty + item.qty } : p
        );
      } else {
        return [...prev, item];
      }
    });
  };
  const removeCart = (name) => {
    setCart(prev => prev.filter(item => item.name !== name));
  };
  return (
    <>
      <CartContext.Provider value={{ cart, addToCart, setCart, removeCart }}>
        <Header />
        <Routes>
          <Route path="/" element={<CardList />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/auth/callback" element={<CallbackHandler />} />
        </Routes>
      </CartContext.Provider>
    </>
  );
}

export default App;
