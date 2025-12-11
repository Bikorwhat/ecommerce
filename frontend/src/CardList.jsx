import { useEffect, useState } from "react";
import Card from "./Card";
import { API_BASE } from "./api";


function CardList() {
  const [cardList, setcardList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Fetch categories
    fetch(`${API_BASE}/products/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    // Fetch products, optionally filtered by category
    const url = selectedCategory
      ? `${API_BASE}/products/cards/?category=${selectedCategory}`
      : `${API_BASE}/products/cards/`;

    fetch(url)
      .then(res => res.json())
      .then(data => setcardList(data))
      .catch(err => console.error("Error fetching products:", err));
  }, [selectedCategory]);

  return (
    <div className="p-6">
      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${selectedCategory === null
            ? "bg-indigo-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${selectedCategory === category.id
              ? "bg-indigo-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cardList.map((card) => (
          <Card
            key={card.id}
            image={card.image_url}
            name={card.name}
            description={card.description}
            price={card.price}
            productId={card.id}
            category_name={card.category_name}
          />
        ))}
      </div>
    </div>
  );
}

export default CardList;
