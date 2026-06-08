import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePopup } from "../../assets/popup.js";
import backgroundVideo from "../../assets/background.mp4";
import "./style.css";

function Register() {
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      // ❌ FAILED
      if (!data.success) {
        showPopup(data.message || "Registration failed", "error");
        return;
      }

      // store user
      localStorage.setItem("user", JSON.stringify({ username, email }));

      setUsername("");
      setEmail("");
      setPassword("");

      window.dispatchEvent(new Event("auth-change"));

      setLoading(false);

      // ✅ SUCCESS POPUP
      showPopup("Registration successful", "success");

      // navigate AFTER popup trigger (safe flow)
      navigate("/");
    } catch (error) {
      console.log(error);
      showPopup("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* 🎥 VIDEO BACKGROUND */}
      <video autoPlay loop muted playsInline className="auth-video-bg">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* 🌑 OVERLAY */}
      <div className="auth-overlay"></div>

      {/* REGISTER BOX */}
      <div className="auth-box">
        <div className="auth-header">
          <span className="back-arrow" onClick={() => navigate("/")}>
            ⬅
          </span>
          <h2>Register</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
