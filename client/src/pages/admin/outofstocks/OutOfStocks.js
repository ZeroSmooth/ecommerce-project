import { useEffect, useState, useRef } from "react";

function OutOfStocks() {
  const [products, setProducts] = useState([]);
  const [editingStock, setEditingStock] = useState({});
  const [stickyHeader, setStickyHeader] = useState(false);
  const tableRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      const lowStock = data.filter((p) => Number(p.stock) <= 5);
      setProducts(lowStock);

      const stockObj = {};
      lowStock.forEach((p) => {
        stockObj[p.id] = p.stock;
      });
      setEditingStock(stockObj);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;
      const tableTop = tableRef.current.getBoundingClientRect().top;
      setStickyHeader(tableTop <= 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStockChange = (id, value) => {
    setEditingStock((prev) => ({ ...prev, [id]: value }));
  };

  const saveStock = async (id) => {
    const newStock = editingStock[id];
    if (newStock === "" || isNaN(newStock)) {
      alert("Please enter a valid stock number");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/products/${id}`, {
        method: "PUT",
        credentials: "include", // ✅ REQUIRED
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock: Number(newStock),
        }),
      });

      if (!res.ok) throw new Error("Failed to update stock");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error updating stock");
    }
  };

  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: "14px",
  };

  const thTdStyle = {
    padding: "6px 10px",
    textAlign: "left",
    border: "1px solid #ccc",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚠️ Low Stock Products (≤5)</h2>

      {products.length === 0 ? (
        <p>All products currently have sufficient stock.</p>
      ) : (
        <table border="1" style={tableStyle} ref={tableRef}>
          <thead
            style={{
              backgroundColor: "transparent",
              position: stickyHeader ? "sticky" : "relative",
              top: stickyHeader ? 0 : "auto",
              zIndex: 5,
            }}
          >
            <tr>
              <th style={thTdStyle}>ID</th>
              <th style={thTdStyle}>Name</th>
              <th style={thTdStyle}>Category</th>
              <th style={thTdStyle}>Brand</th>
              <th style={thTdStyle}>Stock</th>
              <th style={thTdStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={thTdStyle}>{p.id}</td>
                <td style={thTdStyle}>{p.name}</td>
                <td style={thTdStyle}>{p.category}</td>
                <td style={thTdStyle}>{p.brand}</td>
                <td style={{ ...thTdStyle, color: "red", fontWeight: "bold" }}>
                  <input
                    type="number"
                    value={editingStock[p.id]}
                    onChange={(e) => handleStockChange(p.id, e.target.value)}
                    style={{ width: "60px" }}
                  />
                </td>
                <td style={thTdStyle}>
                  <button
                    onClick={() => saveStock(p.id)}
                    style={{
                      padding: "6px 12px",
                      background: "#43a047",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OutOfStocks;
