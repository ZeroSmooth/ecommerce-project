import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import backgroundVideo from "../../../assets/background.mp4";
import "../../../assets/videoBackground.css";

function Checkout() {
  const navigate = useNavigate();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [addressInput, setAddressInput] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("COD");
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [total, setTotal] = useState(0);
  const [showVoucher, setShowVoucher] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("checkoutItems")) || [];

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    setCheckoutItems(items);

    const sum = items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);

    setTotal(sum);
  }, [navigate]);

  // ---------------- VOUCHER ----------------
  const handleApplyVoucher = async () => {
    if (!voucherInput) return alert("Enter voucher code!");

    const res = await fetch(
      "https://ecommerce-project-zpx8.onrender.com/admin/vouchers",
      {
        headers: { Authorization: "Bearer " + token },
      },
    );

    const data = await res.json();
    const v = (Array.isArray(data) ? data : []).find(
      (x) => x.code.toLowerCase() === voucherInput.toLowerCase(),
    );

    if (!v) return alert("Invalid voucher");
    if (v.used === "Yes") return alert("Already used");

    const numValue = Number(v.value);

    if (isNaN(numValue) || numValue <= 0) return alert("Invalid voucher value");

    const discount = v.type === "percent" ? (total * numValue) / 100 : numValue;

    setTotal(Math.max(total - discount, 0));
    setAppliedVoucher(v);
  };

  const handleUndoVoucher = () => {
    const original = checkoutItems.reduce(
      (acc, i) => acc + i.price * (i.quantity || 1),
      0,
    );

    setTotal(original);
    setAppliedVoucher(null);
    setVoucherInput("");
  };

  // ---------------- PLACE ORDER (RESTORED) ----------------
  const handlePlaceOrder = async () => {
    if (!addressInput) {
      alert("Please enter a delivery address!");
      return;
    }

    //  REDIRECT TO GCASH PAGE IF SELECTED
    if (selectedPayment === "GCash") {
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          user: localStorage.getItem("username") || "Guest",
          items: checkoutItems,
          address: addressInput,
          voucher: appliedVoucher ? appliedVoucher.code : null,
          total,
          payment: "GCash",
          date: new Date().toISOString(),
        }),
      );

      navigate("/gcash");
      return;
    }

    const order = {
      user: localStorage.getItem("username") || "Guest",
      items: checkoutItems.map((i) => ({
        ...i,
        qty: i.quantity || 1,
      })),
      address: addressInput,
      voucher: appliedVoucher ? appliedVoucher.code : null,
      total,
      payment: selectedPayment,
      date: new Date().toISOString(),
    };

    try {
      await fetch(
        "https://ecommerce-project-zpx8.onrender.com/admin/receipts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        },
      );

      // reduce stock
      for (const item of checkoutItems) {
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

      if (appliedVoucher) {
        await fetch(
          `https://ecommerce-project-zpx8.onrender.com/admin/vouchers/use/${appliedVoucher.code}`,
          { method: "PATCH" },
        );
      }

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const remaining = cart.filter(
        (c) => !checkoutItems.some((o) => o.id === c.id),
      );

      localStorage.setItem("cart", JSON.stringify(remaining));
      localStorage.setItem("placeOrderItems", JSON.stringify(order));
      localStorage.removeItem("checkoutItems");

      navigate("/placeorder");
    } catch (err) {
      alert("Order failed");
    }
  };

  if (checkoutItems.length === 0) return <p>Loading...</p>;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* 🎥 VIDEO BACKGROUND */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* CENTER WRAPPER */}
      <div
        style={{
          padding: "120px 20px 60px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "1000px",
            display: "flex",
            gap: "30px",

            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "18px",
            padding: "30px",
            color: "#fff",
          }}
        >
          {/* LEFT */}
          <div style={{ flex: 1 }}>
            {/* BACK BUTTON (ABOVE TITLE) */}
            <div style={{ marginBottom: "10px" }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  padding: "8px 14px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  backdropFilter: "blur(10px)",
                  transition: "transform 0.2s ease",
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
            </div>

            {/* TITLE */}
            <h1 style={{ marginBottom: "20px" }}>Checkout</h1>

            <label>Delivery Address</label>
            <input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid rgba(255,255,255,0.3)",
                background: "rgba(0,0,0,0.2)",
                color: "#fff",
                marginTop: "5px",
              }}
            />

            <div style={{ marginTop: "20px" }}>
              <label>Payment</label>
              <div>
                <label>
                  <input
                    type="radio"
                    value="COD"
                    checked={selectedPayment === "COD"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />{" "}
                  COD
                </label>

                <label style={{ marginLeft: "15px" }}>
                  <input
                    type="radio"
                    value="GCash"
                    checked={selectedPayment === "GCash"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />{" "}
                  GCash
                </label>
              </div>
            </div>

            {/* VOUCHER */}
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => setShowVoucher(!showVoucher)}
                style={btnStyle("#444")}
              >
                {showVoucher ? "Hide Voucher" : "Voucher"}
              </button>

              {showVoucher && !appliedVoucher && (
                <div style={{ marginTop: "10px" }}>
                  <input
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    style={inputStyle}
                  />

                  <button
                    onClick={handleApplyVoucher}
                    style={btnStyle("#2196f3")}
                  >
                    Apply
                  </button>
                </div>
              )}

              {appliedVoucher && (
                <div style={{ marginTop: "10px" }}>
                  <span>✔ {appliedVoucher.code}</span>
                  <button
                    onClick={handleUndoVoucher}
                    style={btnStyle("#ff5252")}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ flex: 1 }}>
            <h2>Summary</h2>

            {checkoutItems.map((i, idx) => (
              <div key={idx}>
                {i.name} × {i.quantity || 1}
              </div>
            ))}

            <hr style={{ margin: "15px 0", opacity: 0.3 }} />

            <h2>Total: ₱{total}</h2>

            <button
              onClick={handlePlaceOrder}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #00c853, #64dd17)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({
  padding: "10px 14px",
  marginLeft: "10px",
  background: bg,
  color: "#fff",
  border: "2px solid rgba(255,255,255,0.25)",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
});

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "2px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.2)",
  color: "#fff",
};

export default Checkout;
