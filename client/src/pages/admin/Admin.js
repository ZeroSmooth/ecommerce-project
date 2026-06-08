import { useState } from "react";

import Products from "./products/Products";
import Users from "./users/Users";
import Receipts from "./receipts/Receipts";
import OutOfStocks from "./outofstocks/OutOfStocks";
import Vouchers from "./vouchers/Vouchers";

import backgroundVideo from "../../assets/background.mp4";
import "../../assets/videoBackground.css";

function Admin() {
  const [activeTab, setActiveTab] = useState("products");

  const btnStyle = (active) => ({
    padding: "10px 16px",
    marginRight: "10px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.25)",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#fff",
    background: active
      ? "linear-gradient(135deg, #00c6ff, #0072ff)"
      : "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    transition: "0.2s",
  });

  return (
    <div style={{ position: "relative", minHeight: "100vh", color: "#fff" }}>
      {/* VIDEO BACKGROUND */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
        }}
      />

      {/* CONTENT */}
      <div
        style={{
          position: "relative",
          padding: "80px 30px",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "25px",
            textShadow: "0 5px 20px rgba(0,0,0,0.6)",
          }}
        >
          🔥 Admin Dashboard
        </h1>

        <div
          style={{
            marginBottom: "25px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <button
            style={btnStyle(activeTab === "products")}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>

          <button
            style={btnStyle(activeTab === "users")}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>

          <button
            style={btnStyle(activeTab === "receipts")}
            onClick={() => setActiveTab("receipts")}
          >
            Receipts
          </button>

          <button
            style={btnStyle(activeTab === "outofstocks")}
            onClick={() => setActiveTab("outofstocks")}
          >
            Out Of Stocks
          </button>

          <button
            style={btnStyle(activeTab === "vouchers")}
            onClick={() => setActiveTab("vouchers")}
          >
            Vouchers
          </button>
        </div>

        <div
          style={{
            padding: "20px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            minHeight: "400px",
          }}
        >
          {activeTab === "products" && <Products />}
          {activeTab === "users" && <Users />}
          {activeTab === "receipts" && <Receipts />}
          {activeTab === "outofstocks" && <OutOfStocks />}
          {activeTab === "vouchers" && <Vouchers />}
        </div>
      </div>
    </div>
  );
}

export default Admin;
