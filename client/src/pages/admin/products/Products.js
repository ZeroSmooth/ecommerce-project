import { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

function Products() {
  const navigate = useNavigate();

  const tableRef = useRef(null);
  const [stickyHeader, setStickyHeader] = useState(false);

  const [productImages, setProductImages] = useState({});
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sortOption, setSortOption] = useState("recommended");

  const [catFocused, setCatFocused] = useState(false);
  const [brandFocused, setBrandFocused] = useState(false);
  const [sortFocused, setSortFocused] = useState(false);

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // STICKY HEADER ON SCROLL
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;
      const tableTop = tableRef.current.getBoundingClientRect().top;
      setStickyHeader(tableTop <= 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    await fetch(`http://localhost:5000/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchProducts();
  };

  // SAVE PRODUCT INFO (TEXT FIELDS)
  const saveProduct = async () => {
    if (!editingProduct) return;

    const body = {
      name: editingProduct.name,
      price: editingProduct.price,
      stock: editingProduct.stock,
      category: editingProduct.category,
      brand: editingProduct.brand || "",
      description: editingProduct.description || "",
    };

    await fetch(`http://localhost:5000/products/${editingProduct.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setEditingProduct(null);
    fetchProducts();
  };

  // IMAGE UPLOAD
  const handleImageSelect = (productId, file) => {
    setProductImages({ ...productImages, [productId]: file });
  };

  const saveImage = async (product) => {
    const file = productImages[product.id];
    if (!file) return alert("Please select an image first");

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("category", product.category);
    formData.append("image", file);

    await fetch(`http://localhost:5000/products/${product.id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    fetchProducts();
  };

  // DERIVE CATEGORIES & BRANDS
  const { categories, brands } = useMemo(() => {
    const catSet = new Set();
    const brandSet = new Set();
    products.forEach((p) => {
      if (p.category) catSet.add(p.category.toString());
      if (p.brand) brandSet.add(p.brand.toString());
    });
    return {
      categories: ["all", ...Array.from(catSet).sort()],
      brands: ["all", ...Array.from(brandSet).sort()],
    };
  }, [products]);

  // FILTERED PRODUCTS
  const filteredProducts = useMemo(() => {
    const search = productSearch.toLowerCase();

    return products
      .filter((p) => {
        const textMatch =
          !search ||
          (p.name && p.name.toLowerCase().includes(search)) ||
          (p.category && p.category.toLowerCase().includes(search)) ||
          (p.brand && p.brand.toLowerCase().includes(search));
        if (!textMatch) return false;

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
  }, [products, productSearch, categoryFilter, brandFilter, sortOption]);

  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: "14px",
  };
  const thTdStyle = { padding: "4px 8px", textAlign: "left" };
  const rowHeight = { height: "40px" };

  const ArrowIcon = ({ up }) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      style={{
        transform: up ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.15s ease",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 4l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      {/* FILTER + SEARCH UI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px 150px 150px 170px 200px",
          gap: "12px 50px",
          marginBottom: "20px",
          alignItems: "start",
        }}
      >
        {/* SEARCH */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500, color: "#333" }}>
            Search:
          </label>
          <input
            type="text"
            placeholder="Search by name, brand, or category..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            style={{
              padding: "10px 14px",
              width: "100%",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>

        {/* CATEGORY */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            position: "relative",
          }}
        >
          <label style={{ fontSize: "14px", fontWeight: 500 }}>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            onFocus={() => setCatFocused(true)}
            onBlur={() => setCatFocused(false)}
            style={{
              padding: "10px 34px 10px 14px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              appearance: "none",
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "12px",
              pointerEvents: "none",
            }}
          >
            <ArrowIcon up={catFocused} />
          </div>
        </div>

        {/* BRAND */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            position: "relative",
          }}
        >
          <label style={{ fontSize: "14px", fontWeight: 500 }}>Brand:</label>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            onFocus={() => setBrandFocused(true)}
            onBlur={() => setBrandFocused(false)}
            style={{
              padding: "10px 34px 10px 14px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              appearance: "none",
            }}
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </option>
            ))}
          </select>
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "12px",
              pointerEvents: "none",
            }}
          >
            <ArrowIcon up={brandFocused} />
          </div>
        </div>

        {/* SORT */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            position: "relative",
          }}
        >
          <label style={{ fontSize: "14px", fontWeight: 500 }}>Sort by:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            onFocus={() => setSortFocused(true)}
            onBlur={() => setSortFocused(false)}
            style={{
              padding: "10px 34px 10px 14px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              appearance: "none",
            }}
          >
            <option value="recommended">Recommended</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "12px",
              pointerEvents: "none",
            }}
          >
            <ArrowIcon up={sortFocused} />
          </div>
        </div>

        {/* INSERT BUTTON */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ color: "transparent" }}>Insert</label>
          <button
            onClick={() => navigate("/admin/insert")}
            style={{
              padding: "10px",
              height: "38px",
              backgroundColor: "#fff",
              border: "1px solid #BFBFBF",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Insert New Product
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table border="1" style={tableStyle} ref={tableRef}>
        <thead
          style={{
            backgroundColor: "transparent",
            position: stickyHeader ? "sticky" : "relative",
            top: stickyHeader ? 0 : "auto",
            zIndex: 5,
          }}
        >
          <tr style={rowHeight}>
            <th style={thTdStyle}>ID</th>
            <th style={thTdStyle}>Name</th>
            <th style={thTdStyle}>Price</th>
            <th style={thTdStyle}>Stock</th>
            <th style={thTdStyle}>Category</th>
            <th style={thTdStyle}>Brand</th>
            <th style={thTdStyle}>Image</th>
            <th style={thTdStyle}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id} style={rowHeight}>
              <td style={thTdStyle}>{p.id}</td>

              <td style={thTdStyle}>
                {editingProduct?.id === p.id ? (
                  <input
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  p.name
                )}
              </td>

              <td style={thTdStyle}>
                {editingProduct?.id === p.id ? (
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value,
                      })
                    }
                  />
                ) : (
                  `₱${p.price}`
                )}
              </td>

              <td style={thTdStyle}>
                {editingProduct?.id === p.id ? (
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: e.target.value,
                      })
                    }
                  />
                ) : (
                  p.stock
                )}
              </td>

              <td style={thTdStyle}>
                {editingProduct?.id === p.id ? (
                  <input
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                      })
                    }
                  />
                ) : (
                  p.category
                )}
              </td>

              <td style={thTdStyle}>
                {editingProduct?.id === p.id ? (
                  <input
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        brand: e.target.value,
                      })
                    }
                  />
                ) : (
                  p.brand
                )}
              </td>

              {/* IMAGE COLUMN */}
              <td style={{ ...thTdStyle, textAlign: "center" }}>
                {p.image && (
                  <img
                    src={`http://localhost:5000/uploads/${p.image}`}
                    width="50"
                    height="35"
                    alt=""
                    style={{ display: "block", margin: "auto 0 5px" }}
                  />
                )}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleImageSelect(p.id, e.dataTransfer.files[0]);
                    }
                  }}
                  style={{
                    width: "80px",
                    height: "35px",
                    border: "2px dashed #888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    textAlign: "center",
                    cursor: "pointer",
                    marginBottom: "2px",
                  }}
                >
                  Drag Image Here
                </div>
                <input
                  type="file"
                  onChange={(e) => handleImageSelect(p.id, e.target.files[0])}
                  style={{ fontSize: "10px" }}
                />
                <button
                  onClick={() => saveImage(p)}
                  style={{ fontSize: "10px" }}
                >
                  Save
                </button>
              </td>

              <td style={thTdStyle}>
                {editingProduct?.id === p.id ? (
                  <button onClick={saveProduct}>Save</button>
                ) : (
                  <button onClick={() => setEditingProduct({ ...p })}>
                    Edit
                  </button>
                )}
                <button onClick={() => deleteProduct(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Products;
