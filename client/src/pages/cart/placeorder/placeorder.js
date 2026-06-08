import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "../../../assets/popup.js";

import backgroundVideo from "../../../assets/background.mp4";
import "../../../assets/videoBackground.css";

function PlaceOrder() {
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  useEffect(() => {
    const placedOrder = JSON.parse(localStorage.getItem("placeOrderItems"));

    // ❌ BLOCK INVALID ACCESS
    if (!placedOrder) {
      navigate("/shop", { replace: true });
      return;
    }

    // 🧹 CLEAN PAYMENT FLOW LOCKS (IMPORTANT)
    localStorage.removeItem("pendingOrder");
    localStorage.removeItem("gcashPaid");

    if (!Array.isArray(placedOrder.items)) {
      placedOrder.items = [];
    }

    setOrder(placedOrder);
  }, [navigate]);

  if (!order) {
    return (
      <div style={{ color: "white", textAlign: "center", padding: "80px" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* VIDEO BACKGROUND */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* CONTENT (UNCHANGED DESIGN) */}
      <div
        style={{
          padding: "120px 20px 60px",
          display: "flex",
          justifyContent: "center",
          color: "white",
        }}
      >
        <div
          style={{
            width: "650px",
            backdropFilter: "blur(18px)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "18px",
            padding: "30px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          }}
        >
          {/* TITLE */}
          <h1 style={{ marginBottom: "10px" }}>🎉 Order Placed Successfully</h1>

          <p style={{ color: "#c8e6c9", marginBottom: "25px" }}>
            Thank you for your purchase!
          </p>

          {/* INFO BLOCK */}
          <div style={{ textAlign: "left", marginBottom: "25px" }}>
            <p>
              <strong>Delivery Address:</strong> {order.address}
            </p>

            <p>
              <strong>Payment Method:</strong> {order.payment}
            </p>

            {order.voucher && (
              <p>
                <strong>Voucher Used:</strong> {order.voucher}
              </p>
            )}

            <p style={{ fontSize: "18px", marginTop: "10px" }}>
              <strong>Total Amount:</strong>{" "}
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#00ffb3",
                }}
              >
                ₱{order.total}
              </span>
            </p>
          </div>

          {/* ITEMS */}
          <div
            style={{
              textAlign: "left",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              paddingTop: "15px",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Items</h3>

            {order.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                }}
              >
                <span>{item.name}</span>
                <span style={{ color: "#c8e6c9" }}>
                  ₱{item.price} × {item.qty || 1}
                </span>
              </div>
            ))}
          </div>

          {/* BUTTON (UNCHANGED) */}
          <button
            onClick={() => {
              localStorage.removeItem("placeOrderItems");

              showPopup("Thank you!", "success", () => {
                navigate("/shop", { replace: true });
              });
            }}
            style={{
              marginTop: "30px",
              padding: "14px 26px",
              background: "linear-gradient(135deg, #43a047, #2e7d32)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              borderRadius: "12px",
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
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrder;
