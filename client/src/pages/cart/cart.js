import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import backgroundVideo from "../../assets/background.mp4";
import "../../assets/videoBackground.css";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);

    const initialSelected = {};
    storedCart.forEach((item) => {
      initialSelected[item.id] = true;
      if (!item.quantity) item.quantity = 1;
    });
    setSelectedItems(initialSelected);
  }, []);

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    const updatedSelected = { ...selectedItems };
    delete updatedSelected[id];
    setSelectedItems(updatedSelected);
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleQuantityChange = (id, newQuantity) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        const qty = Math.max(1, Math.min(newQuantity, item.stock || 1000));
        return { ...item, quantity: qty };
      }
      return item;
    });

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems[item.id]) {
        return total + Number(item.price) * (item.quantity || 1);
      }
      return total;
    }, 0);
  };

  const handleCheckout = async () => {
    const itemsToCheckout = cartItems.filter((item) => selectedItems[item.id]);

    if (itemsToCheckout.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    const total = itemsToCheckout.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0,
    );

    // 🧠 CLEAN OLD PAYMENT STATE (IMPORTANT)
    localStorage.removeItem("gcashPaid");
    localStorage.removeItem("placeOrderItems");

    // 💾 SAVE CHECKOUT FLOW
    localStorage.setItem("checkoutItems", JSON.stringify(itemsToCheckout));

    // 💳 THIS IS FOR GCASH FLOW
    localStorage.setItem(
      "pendingOrder",
      JSON.stringify({
        items: itemsToCheckout,
        total,
        address: "",
        payment: null,
        voucher: null,
      }),
    );

    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <video autoPlay loop muted playsInline className="background-video">
          <source src={backgroundVideo} type="video/mp4" />
        </video>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
            Your Cart is Empty
          </h1>

          <p style={{ color: "#ccc", marginBottom: "25px" }}>
            Looks like you haven’t added anything yet.
          </p>

          <button
            onClick={() => navigate("/shop")}
            style={{
              padding: "14px 30px",
              background: "linear-gradient(135deg, #43a047, #2e7d32)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
              borderRadius: "14px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              backdropFilter: "blur(10px)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            SHOP NOW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* VIDEO BACKGROUND */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* CART CONTENT */}
      <div
        style={{
          padding: "120px 20px 60px",
          maxWidth: "1000px",
          margin: "auto",
          color: "white",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Your Cart</h1>

        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={!!selectedItems[item.id]}
                onChange={() => handleCheckboxChange(item.id)}
              />

              {item.image && (
                <img
                  src={`http://localhost:5000/uploads/${item.image}`}
                  alt={item.name}
                  width="90"
                  style={{
                    borderRadius: "8px",
                    background: "white",
                    padding: "4px",
                  }}
                />
              )}

              <div>
                <h3 style={{ margin: 0 }}>{item.name}</h3>

                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                  <span style={{ color: "#a5d6a7" }}>₱{item.price} ×</span>

                  <input
                    type="number"
                    value={item.quantity || 1}
                    min={1}
                    max={item.stock || 1000}
                    onChange={(e) =>
                      handleQuantityChange(item.id, Number(e.target.value))
                    }
                    style={{
                      width: "60px",
                      padding: "4px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  />

                  <span style={{ color: "#a5d6a7" }}>
                    = ₱{(item.price * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              style={{
                padding: "8px 14px",
                background: "rgba(255,0,0,0.15)",
                border: "1px solid rgba(255,0,0,0.4)",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Remove
            </button>
          </div>
        ))}

        {/* TOTAL */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: "20px",
          }}
        >
          <h2>Total: ₱{getTotal().toFixed(2)}</h2>

          <button
            onClick={handleCheckout}
            style={{
              padding: "12px 25px",
              background: "linear-gradient(135deg, #43a047, #2e7d32)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
