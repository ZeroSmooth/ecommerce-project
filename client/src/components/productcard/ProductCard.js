import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function ProductCard({ product }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const isSoldOut = product.stock <= 0;

  const handleMouseMove = (e) => {
    if (isSoldOut) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const tiltX = (-y / rect.height) * 30;
    const tiltY = (x / rect.width) * 40;

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
    card.style.boxShadow = `${-tiltY}px ${tiltX}px 40px rgba(0,0,0,1)`;
    card.style.zIndex = 10;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;

    card.style.transition =
      "transform 0.4s ease-out, box-shadow 0.4s ease-out, z-index 0s";

    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.boxShadow = "0 10px 20px rgba(0,0,0,0.5)";
    card.style.zIndex = 1;
  };

  const handleMouseEnter = () => {
    if (isSoldOut) return;

    const card = cardRef.current;
    card.style.transition = "transform 0.4s ease-out, box-shadow 0.4s ease-out";
  };

  const handleClick = () => {
    if (isSoldOut) return; // ❌ block navigation

    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    navigate(`/product/${product.id}-${slug}`);
  };

  return (
    <div
      className="product-card"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      style={{
        cursor: isSoldOut ? "not-allowed" : "pointer",
        opacity: isSoldOut ? 0.6 : 1,
        filter: isSoldOut ? "grayscale(1)" : "none",
        position: "relative",
      }}
    >
      <div className="product-image">
        {product.image ? (
          <img
            src={`https://ecommerce-project-zpx8.onrender.com/uploads/${product.image}`}
            alt={product.name}
            className="product-img"
          />
        ) : (
          <div className="no-image">No Image</div>
        )}

        {/* SOLD OUT BADGE */}
        {isSoldOut && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(255, 0, 0, 0.85)",
              color: "white",
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              zIndex: 10,
            }}
          >
            SOLD OUT
          </div>
        )}
      </div>

      <hr className="product-divider" />

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₱{product.price}</p>

        <p className="product-stock">
          Stock: {product.stock <= 0 ? "0 (Sold Out)" : product.stock}
        </p>

        <p className="product-brand">Brand: {product.brand || "-"}</p>

        <span className="product-category">{product.category}</span>

        <hr className="product-divider" />

        {product.description && (
          <p className="product-description">
            {product.description.length > 60
              ? product.description.slice(0, 57) + "..."
              : product.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
