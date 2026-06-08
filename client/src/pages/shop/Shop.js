import backgroundVideo from "../../assets/background.mp4";
import "../../assets/videoBackground.css";
import "./shop.css";

import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "../../components/productcard/ProductCard";

function Shop() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sortOption, setSortOption] = useState("recommended");

  // URL category
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedCategory = params.get("category");
    setCategoryFilter(selectedCategory || "all");
  }, [location.search]);

  // FETCH
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          "https://ecommerce-project-zpx8.onrender.com/products",
          { signal: controller.signal },
        );

        clearTimeout(timeout);

        if (!res.ok) {
          const text = await res.text();
          console.log("SERVER ERROR RESPONSE:", text);
          throw new Error(text);
        }

        const data = await res.json();

        const normalized = data.map((p) => ({
          ...p,
          id: p.id || p.ID,
          name: p.name || "No Name",
          price: Number(p.price || 0),
          brand: p.brand || "Unknown",
          category: p.category || "Uncategorized",
        }));

        setProducts(normalized);
      } catch (err) {
        console.log("PRODUCT FETCH ERROR:", err);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // FILTERS
  const { categories, brands } = useMemo(() => {
    const cat = new Set();
    const br = new Set();

    products.forEach((p) => {
      cat.add(p.category);
      br.add(p.brand);
    });

    return {
      categories: ["all", ...Array.from(cat)],
      brands: ["all", ...Array.from(br)],
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();

    return products
      .filter((p) => {
        if (
          s &&
          !p.name.toLowerCase().includes(s) &&
          !p.brand.toLowerCase().includes(s) &&
          !p.category.toLowerCase().includes(s)
        ) {
          return false;
        }

        if (categoryFilter !== "all" && p.category !== categoryFilter)
          return false;

        if (brandFilter !== "all" && p.brand !== brandFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "low-high") return a.price - b.price;
        if (sortOption === "high-low") return b.price - a.price;
        return 0;
      });
  }, [products, search, categoryFilter, brandFilter, sortOption]);

  return (
    <div className="shop-wrapper">
      {/* BACKGROUND */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      <div className="shop-overlay" />

      <div className="shop-content">
        {/* TITLE */}
        <h1 className="shop-title">SHOP</h1>

        {/* FILTER BAR */}
        <div className="shop-filters">
          {/* LEFT */}
          <div className="shop-left">
            <button onClick={() => navigate(-1)} className="shop-back">
              ← Back
            </button>
          </div>

          {/* CENTER */}
          <div className="shop-center">
            <input
              className="shop-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* RIGHT */}
          <div className="shop-right">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="shop-select"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Categories - All" : c}
                </option>
              ))}
            </select>

            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="shop-select"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b === "all" ? "Brands - All" : b}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="shop-select"
            >
              <option value="recommended">Recommended</option>
              <option value="low-high">Price Low → High</option>
              <option value="high-low">Price High → Low</option>
            </select>
          </div>
        </div>

        {/* STATUS */}
        {loading && <p className="status">Loading...</p>}
        {error && <p className="status error">{error}</p>}

        {/* PRODUCTS */}
        <div className="shop-grid">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Shop;
