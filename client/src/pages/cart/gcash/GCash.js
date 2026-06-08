import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import gcashIcon from "./gcashicon.png";

function GCash() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const order = JSON.parse(localStorage.getItem("pendingOrder"));

  useEffect(() => {
    const paid = localStorage.getItem("gcashPaid");
    const currentOrder = JSON.parse(localStorage.getItem("pendingOrder"));

    if (!currentOrder || !currentOrder.items?.length || paid === "true") {
      navigate("/shop", { replace: true });
    }
  }, [navigate]);

  const handlePay = async () => {
    if (!order || !order.items?.length) {
      navigate("/shop", { replace: true });
      return;
    }

    setLoading(true);

    try {
      // mark paid FIRST (prevents double entry)
      localStorage.setItem("gcashPaid", "true");

      await fetch(
        "https://ecommerce-project-zpx8.onrender.com/admin/receipts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        },
      );

      for (const item of order.items) {
        await fetch(
          `https://ecommerce-project-zpx8.onrender.com/products/${item.id}/reduce-stock`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // ⭐ ADD THIS
            body: JSON.stringify({ qty: item.quantity || 1 }),
          },
        );
      }

      // 🧹 REMOVE CART ITEMS AFTER SUCCESS
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      const remaining = cart.filter(
        (c) => !order.items.some((o) => o.id === c.id),
      );

      localStorage.setItem("cart", JSON.stringify(remaining));

      // cleanup flow
      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("pendingOrder");

      localStorage.setItem("placeOrderItems", JSON.stringify(order));

      navigate("/placeorder", { replace: true });
    } catch (err) {
      localStorage.removeItem("gcashPaid");
      alert("Payment failed");
    }
  };

  return (
    <div style={styles.bg}>
      <img src={gcashIcon} alt="GCash" style={styles.icon} />

      <div style={styles.card}>
        <h1>GCash Payment</h1>
        <p>Secure Payment Gateway</p>

        <div style={styles.amountBox}>₱{order?.total || 0}</div>

        <button onClick={handlePay} style={styles.payBtn}>
          {loading ? "Processing..." : "Pay Now"}
        </button>

        <button
          onClick={() => navigate("/checkout", { replace: true })}
          style={styles.backBtn}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at top, #1e88e5, #0d47a1, #001e3c)",
    color: "white",
  },
  icon: {
    width: "320px",
    marginBottom: "20px",
  },
  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "18px",
    textAlign: "center",
    backdropFilter: "blur(15px)",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  amountBox: {
    marginTop: "20px",
    fontSize: "32px",
    fontWeight: "bold",
    color: "#00e5ff",
  },
  payBtn: {
    marginTop: "25px",
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#fff",
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  },
  backBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
};

export default GCash;
