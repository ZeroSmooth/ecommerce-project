import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePopup } from "../../assets/popup.js";

import backgroundVideo from "../../assets/background.mp4";
import "../../assets/videoBackground.css";

function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  const productId = slug ? slug.split("-")[0] : null;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) return;

    fetch(`http://localhost:5000/products/${productId}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [productId]);

  const addToCart = () => {
    try {
      const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

      const productIndex = existingCart.findIndex(
        (item) => item.id === product.id,
      );

      if (productIndex !== -1) {
        const updatedCart = [...existingCart];
        const newQuantity =
          (updatedCart[productIndex].quantity || 1) + quantity;

        updatedCart[productIndex].quantity =
          newQuantity > product.stock ? product.stock : newQuantity;

        localStorage.setItem("cart", JSON.stringify(updatedCart));
      } else {
        existingCart.push({ ...product, quantity });
        localStorage.setItem("cart", JSON.stringify(existingCart));
      }

      // ✅ SUCCESS POPUP
      showPopup("Product added to cart", "success");
    } catch (err) {
      console.log(err);
      showPopup("Failed to add product", "error");
    }
  };

  const buyNow = () => {
    const soloItem = [{ ...product, quantity }];
    localStorage.setItem("checkoutItems", JSON.stringify(soloItem));
    navigate("/checkout");
  };

  if (!product) {
    return <div style={{ padding: "40px", color: "#fff" }}>Loading...</div>;
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* 🎥 VIDEO BACKGROUND */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* MAIN CONTENT */}
      <div
        style={{
          padding: "120px 20px 60px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "900px",
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "18px",
            padding: "35px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", gap: "40px" }}>
            {/* LEFT SIDE */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* BACK BUTTON (NEW) */}
              <button
                onClick={() => navigate(-1)}
                style={{
                  padding: "10px 16px",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  borderRadius: "10px",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  fontWeight: "bold",
                  width: "fit-content",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                ← Back
              </button>

              {/* IMAGE */}
              <div
                style={{
                  background: "rgba(255,255,255)",
                  padding: "12px",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={`http://localhost:5000/uploads/${product.image}`}
                  alt={product.name}
                  width="320"
                  style={{
                    borderRadius: "8px",
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </div>
            </div>

            {/* DETAILS */}
            <div style={{ flex: 1 }}>
              <h1 style={{ marginTop: 0, color: "#fff" }}>{product.name}</h1>

              <p
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#00ffb3",
                }}
              >
                ₱{product.price}
              </p>

              <p>
                <strong>Stock:</strong> {product.stock}
              </p>
              <p>
                <strong>Brand:</strong> {product.brand || "-"}
              </p>
              <p>
                <strong>Category:</strong> {product.category}
              </p>

              <p style={{ marginTop: "15px" }}>
                <strong>Description:</strong>
              </p>

              <p style={{ color: "#e6e6e6", lineHeight: "1.6" }}>
                {product.description || "-"}
              </p>

              {/* QUANTITY */}
              <div style={{ marginTop: "15px", marginBottom: "15px" }}>
                <label>
                  <strong>Quantity:</strong>
                </label>

                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > product.stock) setQuantity(product.stock);
                    else if (val < 1) setQuantity(1);
                    else setQuantity(val);
                  }}
                  style={{
                    width: "60px",
                    padding: "5px",
                    marginLeft: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              {/* BUTTONS */}
              <div style={{ display: "flex", gap: "15px" }}>
                <button
                  onClick={addToCart}
                  style={{
                    padding: "12px 24px",
                    background: "#43a047",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Add to Cart
                </button>

                <button
                  onClick={buyNow}
                  style={{
                    padding: "12px 24px",
                    background: "#ff9800",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
