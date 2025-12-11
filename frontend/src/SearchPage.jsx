import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "./api";
import Card from "./Card";

export default function SearchPage() {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("query");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      const res = await api.get( `${API_BASE}/products/search/?q=${query}`);
      console.log(res.data);
      setResults(res.data);
    };

    fetchResults();
  }, [query]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Results for: "{query}"</h2>
      <div className="flex flex-wrap gap-4 mt-4">
        {results.map((item) => (
          <Card
    key={item.id}
    image={item.image_url}  // <-- explicitly map it
    name={item.name}
    description={item.description}
    price={item.price}
    productId={item.id}
    category_name={item.category_name}
  />
        ))}
      </div>
    </div>
  );
}
