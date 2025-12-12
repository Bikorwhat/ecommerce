import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "./cartContext";
import { AuthContext } from "./AuthContext";
import api, { API_BASE } from "./api";

const Header = () => {
  const { cart } = useContext(CartContext);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const uniqueItemCount = cart.length;
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const login = () => {
    window.location.href = `${API_BASE}/login`;
  }

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  }

  const handleProfile = () => {
    navigate("/history");
  }

  // Debounce effect
  useEffect(() => {
    // Only fetch if query has at least 2 characters
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(() => {
      const fetchSuggestions = async () => {
        try {
          const res = await api.get(
            `${API_BASE}/products/search/?q=${query}`
          );
          setSuggestions(res.data);
        } catch (err) {
          console.log(err);
        }
      };

      fetchSuggestions();
    }, 400); // wait 400ms after user stops typing

    // Cleanup: clear previous timeout if user types again
    return () => clearTimeout(handler);
  }, [query]);

  const handleSelect = (name) => {
    setQuery(name);
    setSuggestions([]);
  };

  const handleSearch = () => {
    window.location.href = `/search?query=${query}`;
  };

  return (
    <div className="w-full bg-indigo-500 flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 sm:gap-0">
      {/* Logo */}
      <Link to="/">
        <h1 className="text-white text-3xl font-bold cursor-pointer">MyShop</h1>
      </Link>

      {/* Search Box */}
      <div className="relative flex-1 max-w-md mx-auto w-full">
        <input
          type="search"

          className="w-full pr-24 p-3 text-sm rounded-md border bg-white appearance-none"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={query.trim().length < 2}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 bg-white shadow-lg rounded mt-1 max-h-60 overflow-y-auto z-50">
            {suggestions.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.name)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auth Section */}
      {isAuthenticated() ? (
        <div className="flex items-center gap-3">
          <span className="text-white text-sm">
            {user?.name || user?.email || 'User'}
          </span>
          <button
            type="button"
            onClick={handleProfile}
            className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
          >
            History
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={login}
          className="text-white mr-4"
        >
          Login
        </button>
      )}

      {/* Cart Icon */}
      <Link to="/cart" className="relative flex-shrink-0">
        <div className="relative w-12 h-12">
          <img src="/scart.png" className="w-full h-full" alt="cart" />
          {uniqueItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {uniqueItemCount}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Header;
