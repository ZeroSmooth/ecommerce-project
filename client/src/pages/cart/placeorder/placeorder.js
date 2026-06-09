import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "../../../assets/popup.js";
import API_URL from "../../../config/api.js";
import backgroundVideo from "../../../assets/background.mp4";
import "../../../assets/videoBackground.css";

function PlaceOrder() {
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  useEffect(() => {
    const placedOrder = JSON.parse(localStorage.getItem("placeOrderItems"));

    if (!placedOrder) {
      navigate("/shop", { replace: true });
      return;
    }

    localStorage.removeItem("pendingOrder");
    localStorage.removeItem("gcashPaid");

    if (!Array.isArray(placedOrder.items)) {
      placedOrder.items = [];
    }

    setOrder(placedOrder);

    // ✅ Send receipt email immediately if email was provided
    if (placedOrder.receiptEmail) {
      fetch(`${API_URL}/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: placedOrder }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Receipt email result:", data))
        .catch((err) => console.error("Receipt email failed:", err));
    }
  }, [navigate]);

  if (!order) {
    return (
      <div style={{ color: "white", textAlign: "center", padding: "80px" }}>
        Loading...
      </div>
    );
  }

  const originalTotal = order.items.reduce(
    (acc, i) => acc + i.price * (i.qty || 1),
    0,
  );
  const discount = originalTotal - order.total;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

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
          <h1 style={{ marginBottom: "10px" }}>Order Placed Successfully</h1>

          <p style={{ color: "#c8e6c9", marginBottom: "25px" }}>
            Thank you for your purchase!
          </p>

          {/* ✅ Email notice */}
          {order.receiptEmail && (
            <div
              style={{
                marginBottom: "20px",
                padding: "10px 16px",
                background: "rgba(0,255,179,0.08)",
                border: "1px solid rgba(0,255,179,0.25)",
                borderRadius: "10px",
                fontSize: "13px",
                color: "#00ffb3",
              }}
            >
              📧 A delivery receipt will be sent to{" "}
              <strong>{order.receiptEmail}</strong> once delivered.
            </div>
          )}

          {/* INFO BLOCK */}
          <div style={{ textAlign: "left", marginBottom: "25px" }}>
            <p>
              <strong>Delivery Address:</strong> {order.address}
            </p>
            <p>
              <strong>Payment Method:</strong> {order.payment}
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

          {/* VOUCHER ROW + TOTAL */}
          <div style={{ textAlign: "left", marginTop: "15px" }}>
            {order.voucher && discount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.15)",
                  fontSize: "14px",
                  color: "#ff8a80",
                }}
              >
                <span>Voucher: {order.voucher}</span>
                <span>- ₱{discount}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0 0",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              <span>Total Amount:</span>
              <span style={{ color: "#00ffb3", fontSize: "22px" }}>
                ₱{order.total}
              </span>
            </div>
          </div>

          {/* BUTTON */}
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
