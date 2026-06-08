import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "../../../assets/popup.js";
import backgroundVideo from "../../../assets/background.mp4";
import "./style.css";

function InsertProduct() {
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setProduct({ ...product, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("category", product.category);
    formData.append("brand", product.brand);
    formData.append("description", product.description);

    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/add-product", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        showPopup(data.message || "Insert failed", "error");
        setLoading(false);
        return;
      }

      // ✅ SUCCESS POPUP WITH CONTINUE ACTION
      showPopup(
        "Product inserted successfully!",
        "success",
        () => navigate("/admin"),
        {
          continueText: "Continue",
        },
      );

      // reset form
      setProduct({
        name: "",
        price: "",
        stock: "",
        category: "",
        brand: "",
        description: "",
      });
      setImage(null);
    } catch (err) {
      console.error(err);
      showPopup("Server error", "error");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <video autoPlay loop muted playsInline className="auth-video-bg">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      <div className="auth-overlay"></div>

      <div className="auth-box admin-box">
        <div className="auth-header">
          <span className="back-arrow" onClick={() => navigate("/admin")}>
            ⬅
          </span>
          <h2>Insert Product</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            placeholder="Product Name"
            value={product.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={product.price}
            onChange={(e) => handleChange("price", e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Stock"
            value={product.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
            required
          />

          <input
            placeholder="Category"
            value={product.category}
            onChange={(e) => handleChange("category", e.target.value)}
          />

          <input
            placeholder="Brand"
            value={product.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={product.description}
            onChange={(e) => handleChange("description", e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              resize: "none",
              minHeight: "80px",
            }}
          />

          <input type="file" onChange={(e) => setImage(e.target.files[0])} />

          <button type="submit" disabled={loading}>
            {loading ? "Inserting..." : "Insert Product"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin")}
            style={{ background: "#777" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default InsertProduct;
