import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "../../../assets/popup.js";
import API_URL from "../../../config/api.js";
import backgroundVideo from "../../../assets/background.mp4";
import "../../../assets/videoBackground.css";

// ============================================================
//  ADDRESS DATA — add more cities / barangays / streets here
// ============================================================
const ADDRESS_DATA = {
  "Valenzuela City": {
    Marulas: [
      "F. Bautista St.",
      "Elysian St.",
      "Dona Ata St.",
      "Sampaguita St.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Jasmine St.",
      "Orchid St.",
    ],
    Karuhatan: [
      "MacArthur Hwy",
      "Karuhatan Rd.",
      "Gen. T. de Leon St.",
      "Magsaysay St.",
      "M.H. Del Pilar St.",
      "Malaya St.",
      "Pag-asa St.",
      "Rosal St.",
      "Camia St.",
      "Evergreen St.",
    ],
    Malinta: [
      "McArthur Highway",
      "Pio Valenzuela St.",
      "M.H. Del Pilar St.",
      "Malanday-Malinta Rd.",
      "Gov. Santiago St.",
      "R. Diaz St.",
      "F. Bautista St.",
      "M. Gregorio St.",
      "T. Santiago St.",
      "A. Pablo St.",
    ],
    Dalandanan: [
      "M.H. Del Pilar St.",
      "P. Gregorio St.",
      "Dalandanan Rd.",
      "A. Fernando St.",
      "L. de Guzman St.",
      "R. Pascual St.",
      "P. Jacinto St.",
      "A. Bonifacio St.",
      "Mabini St.",
      "Rizal St.",
    ],

    GenTDeLeon: [
      "Gen. T. de Leon Rd.",
      "Paso de Blas Rd.",
      "Lawang Bato Rd.",
      "Maysan Rd.",
      "C. Arellano St.",
      "A. Pablo St.",
      "T. Santiago St.",
      "R. Diaz St.",
      "M. Gregorio St.",
      "P. Valenzuela St.",
    ],

    Maysan: [
      "Maysan Rd.",
      "Maysan Service Rd.",
      "M.H. Del Pilar St.",
      "P. Gregorio St.",
      "L. de Guzman St.",
      "A. Fernando St.",
      "Mabini St.",
      "Bonifacio St.",
      "Rizal St.",
      "Sampaguita St.",
    ],

    ArkongBato: [
      "Arkong Bato Rd.",
      "M.H. Del Pilar St.",
      "Pio Valenzuela St.",
      "Gov. Santiago St.",
      "A. Pablo St.",
      "R. Diaz St.",
      "Mabini St.",
      "Rizal St.",
      "Bonifacio St.",
      "Sampaguita St.",
    ],

    PasoDeBlas: [
      "Paso de Blas Rd.",
      "Gen. T. de Leon Rd.",
      "Lawang Bato Rd.",
      "Maysan Rd.",
      "A. Pablo St.",
      "P. Gregorio St.",
      "M.H. Del Pilar St.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
    ],

    Balangkas: [
      "Balangkas Rd.",
      "M.H. Del Pilar St.",
      "Gov. Santiago St.",
      "Pio Valenzuela St.",
      "Mabini St.",
      "Bonifacio St.",
      "Rizal St.",
      "Sampaguita St.",
      "Acacia St.",
      "Camia St.",
    ],

    VeinteReales: [
      "Veinte Reales Rd.",
      "Paso de Blas Rd.",
      "Gen. T. de Leon Rd.",
      "Lawang Bato Rd.",
      "M.H. Del Pilar St.",
      "Rizal St.",
      "Bonifacio St.",
      "Mabini St.",
      "Acacia St.",
      "Sampaguita St.",
    ],
  },
  "Caloocan City": {
    "Bagong Barrio": [
      "10th Ave",
      "11th Ave",
      "12th Ave",
      "13th Ave",
      "14th Ave",
      "15th Ave",
      "16th Ave",
      "17th Ave",
      "18th Ave",
      "19th Ave",
    ],

    Camarin: [
      "Camarin Rd.",
      "Susano Rd.",
      "Phase 1",
      "Phase 2",
      "Phase 3",
      "Phase 4",
      "Phase 5",
      "Pangarap Village",
      "Rainbow Village",
      "Maligaya Rd.",
    ],

    Deparo: [
      "Deparo Rd.",
      "Narra St.",
      "Mabini St.",
      "Rizal St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Sampaguita St.",
      "Jasmine St.",
      "Rosal St.",
    ],

    Bagumbong: [
      "Bagumbong Rd.",
      "Phase 8",
      "Phase 9",
      "Phase 10",
      "Phase 11",
      "Phase 12",
      "Phase 13",
      "Phase 14",
      "Phase 15",
      "Phase 16",
    ],

    Tala: [
      "Dr. T. S. Cruz Rd.",
      "Tala Main Rd.",
      "Sampaguita St.",
      "Rosal St.",
      "Camia St.",
      "Jasmine St.",
      "Acacia St.",
      "Rizal St.",
      "Bonifacio St.",
      "Mabini St.",
    ],

    Baesa: [
      "Quirino Highway",
      "Baesa Rd.",
      "Katipunan St.",
      "Mabini St.",
      "Rizal St.",
      "Acacia St.",
      "Bonifacio St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
    ],

    Maypajo: [
      "A. Mabini St.",
      "P. Zamora St.",
      "5th Ave",
      "6th Ave",
      "7th Ave",
      "8th Ave",
      "9th Ave",
      "10th Ave",
      "Rizal Ave.",
      "M.H. Del Pilar St.",
    ],

    GracePark: [
      "Rizal Ave.",
      "8th Ave",
      "9th Ave",
      "10th Ave",
      "11th Ave",
      "12th Ave",
      "13th Ave",
      "14th Ave",
      "15th Ave",
      "16th Ave",
    ],

    Sangandaan: [
      "A. Mabini St.",
      "Samson Rd.",
      "C-3 Rd.",
      "Rizal Ave.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
      "Sampaguita St.",
    ],

    NovalichesNorth: [
      "Quirino Highway",
      "General Luis St.",
      "Susano Rd.",
      "Maligaya Rd.",
      "Rizal St.",
      "Bonifacio St.",
      "Mabini St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
    ],
  },

  "Meycauayan City": {
    Bagbaguin: [
      "Bagbaguin Rd.",
      "Iba Rd.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
      "Sampaguita St.",
    ],

    Banga: [
      "Banga Rd.",
      "M.H. Del Pilar St.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
      "Sampaguita St.",
    ],

    Calvario: [
      "Calvario Rd.",
      "Perez St.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
      "Sampaguita St.",
    ],

    Camalig: [
      "Camalig Rd.",
      "Perez St.",
      "Malhacan Rd.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
    ],

    Hulo: [
      "Hulo Rd.",
      "Perez St.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
      "Sampaguita St.",
    ],

    Langka: [
      "Langka Rd.",
      "Iba Rd.",
      "Perez St.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
    ],

    Lawa: [
      "Lawa Rd.",
      "Perez St.",
      "Malhacan Rd.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
    ],

    Malhacan: [
      "Malhacan Rd.",
      "Perez St.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
      "Sampaguita St.",
    ],

    Pantoc: [
      "Pantoc Rd.",
      "Iba Rd.",
      "Perez St.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
    ],

    Perez: [
      "Perez St.",
      "Malhacan Rd.",
      "Iba Rd.",
      "Rizal St.",
      "Mabini St.",
      "Bonifacio St.",
      "Acacia St.",
      "Camia St.",
      "Rosal St.",
      "Jasmine St.",
    ],
  },
};

function Checkout() {
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedStreet, setSelectedStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("COD");
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [total, setTotal] = useState(0);
  const [showVoucher, setShowVoucher] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState("");

  const token = localStorage.getItem("token");

  // derived lists
  const barangays = selectedCity ? Object.keys(ADDRESS_DATA[selectedCity]) : [];
  const streets =
    selectedCity && selectedBarangay
      ? ADDRESS_DATA[selectedCity][selectedBarangay]
      : [];

  // full address string
  const fullAddress =
    selectedCity && selectedBarangay && selectedStreet && houseNumber.trim()
      ? `${houseNumber}, ${selectedStreet}, ${selectedBarangay}, ${selectedCity}`
      : "";

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("checkoutItems")) || [];
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
    setCheckoutItems(items);
    setTotal(items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0));
  }, [navigate]);

  // reset downstream dropdowns when parent changes
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSelectedBarangay("");
    setSelectedStreet("");
    setHouseNumber("");
  };

  const handleBarangayChange = (e) => {
    setSelectedBarangay(e.target.value);
    setSelectedStreet("");
    setHouseNumber("");
  };

  // ---------------- VOUCHER ----------------
  const handleApplyVoucher = async () => {
    if (!voucherInput) return showPopup("Enter voucher code!", "error");

    const res = await fetch(`${API_URL}/admin/vouchers`, {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();
    const v = (Array.isArray(data) ? data : []).find(
      (x) => x.code.toLowerCase() === voucherInput.toLowerCase(),
    );

    if (!v) return showPopup("Invalid voucher", "error");
    if (v.used === "Yes") return showPopup("Voucher already used", "error");

    const numValue = Number(v.value);
    if (isNaN(numValue) || numValue <= 0)
      return showPopup("Invalid voucher value", "error");

    const discount = v.type === "percent" ? (total * numValue) / 100 : numValue;
    setTotal(Math.max(total - discount, 0));
    setAppliedVoucher(v);
    showPopup(`Voucher ${v.code} applied!`, "success");
  };

  const handleUndoVoucher = () => {
    setTotal(
      checkoutItems.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0),
    );
    setAppliedVoucher(null);
    setVoucherInput("");
  };

  // ---------------- PLACE ORDER ----------------
  const handlePlaceOrder = async () => {
    if (!fullAddress) {
      showPopup("Please complete your delivery address!", "error");
      return;
    }

    if (selectedPayment === "GCash") {
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          user: localStorage.getItem("username") || "Guest",
          items: checkoutItems,
          address: fullAddress,
          voucher: appliedVoucher ? appliedVoucher.code : null,
          total,
          payment: "GCash",
          date: new Date().toISOString(),
          receiptEmail: receiptEmail.trim() || null,
        }),
      );
      navigate("/gcash");
      return;
    }

    const order = {
      user: localStorage.getItem("username") || "Guest",
      items: checkoutItems.map((i) => ({ ...i, qty: i.quantity || 1 })),
      address: fullAddress,
      voucher: appliedVoucher ? appliedVoucher.code : null,
      total,
      payment: selectedPayment,
      date: new Date().toISOString(),
      receiptEmail: receiptEmail.trim() || null,
    };

    try {
      await fetch(`${API_URL}/admin/receipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      for (const item of checkoutItems) {
        await fetch(`${API_URL}/products/${item.id}/reduce-stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ qty: item.quantity || 1 }),
        });
      }

      if (appliedVoucher) {
        await fetch(
          `${API_URL}/admin/vouchers/use/${encodeURIComponent(appliedVoucher.code)}`,
          { method: "PATCH" },
        );
      }

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      localStorage.setItem(
        "cart",
        JSON.stringify(
          cart.filter((c) => !checkoutItems.some((o) => o.id === c.id)),
        ),
      );
      localStorage.setItem("placeOrderItems", JSON.stringify(order));
      localStorage.removeItem("checkoutItems");

      navigate("/placeorder");
    } catch {
      showPopup("Order failed. Please try again.", "error");
    }
  };

  if (checkoutItems.length === 0) return <p>Loading...</p>;

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
            <div style={{ marginBottom: "10px" }}>
              <button
                onClick={() => navigate(-1)}
                style={backBtnStyle}
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

            <h1 style={{ marginBottom: "20px" }}>Checkout</h1>

            {/* ── CASCADING ADDRESS DROPDOWNS ── */}
            <label style={{ fontWeight: "bold" }}>Delivery Address</label>

            {/* City */}
            <select
              value={selectedCity}
              onChange={handleCityChange}
              style={selectStyle}
            >
              <option value="">— Select City —</option>
              {Object.keys(ADDRESS_DATA).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Barangay */}
            <select
              value={selectedBarangay}
              onChange={handleBarangayChange}
              disabled={!selectedCity}
              style={{ ...selectStyle, opacity: selectedCity ? 1 : 0.5 }}
            >
              <option value="">— Select Barangay —</option>
              {barangays.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Street */}
            <select
              value={selectedStreet}
              onChange={(e) => {
                setSelectedStreet(e.target.value);
                setHouseNumber("");
              }}
              disabled={!selectedBarangay}
              style={{ ...selectStyle, opacity: selectedBarangay ? 1 : 0.5 }}
            >
              <option value="">— Select Street —</option>
              {streets.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {/* House Number */}
            <input
              type="text"
              placeholder="House Number"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              disabled={!selectedStreet}
              style={{
                ...inputStyle,
                width: "100%",
                marginTop: "8px",
                opacity: selectedStreet ? 1 : 0.5,
                boxSizing: "border-box",
              }}
            />

            {/* Preview */}
            {fullAddress && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px 14px",
                  background: "rgba(0,255,179,0.1)",
                  border: "1px solid rgba(0,255,179,0.3)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#00ffb3",
                }}
              >
                📍 {fullAddress}
              </div>
            )}

            {/* Payment */}
            <div style={{ marginTop: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Payment</label>
              <div style={{ marginTop: "8px" }}>
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

            {/* Voucher */}
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

            <div style={{ marginTop: "16px" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px" }}>
                Receipt Email{" "}
                <span style={{ color: "#aaa", fontWeight: "normal" }}>
                  (optional)
                </span>
              </label>
              <input
                type="email"
                placeholder="e.g. abcd1234@email.com"
                value={receiptEmail}
                onChange={(e) => setReceiptEmail(e.target.value)}
                style={{
                  ...inputStyle,
                  width: "100%",
                  marginTop: "8px",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  boxSizing: "border-box",
                }}
              />
              {receiptEmail && (
                <p
                  style={{ fontSize: "12px", color: "#aaa", marginTop: "5px" }}
                >
                  📧 Delivery confirmation will be sent to this email.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  width: "100%",
  padding: "11px 14px",
  marginTop: "8px",
  borderRadius: "10px",
  border: "2px solid rgba(255,255,255,0.3)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer",
  appearance: "auto",
};

const backBtnStyle = {
  padding: "8px 14px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.3)",
  color: "#fff",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  backdropFilter: "blur(10px)",
  transition: "transform 0.2s ease",
};

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
