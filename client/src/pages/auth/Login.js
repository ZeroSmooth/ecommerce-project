import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePopup } from "../../assets/popup.js";
import backgroundVideo from "../../assets/background.mp4";
import "./style.css";

function Login() {
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      // ❌ LOGIN FAILED
      if (!data.success) {
        showPopup(data.message || "Login failed", "error");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ SUCCESS
      showPopup("Login successful", "success");

      setEmail("");
      setPassword("");
      setRememberMe(false);

      window.dispatchEvent(new Event("auth-change"));

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

      {/* DARK OVERLAY */}
      <div className="auth-overlay"></div>

      {/* LOGIN BOX */}
      <div className="auth-box">
        <div className="auth-header">
          <span className="back-arrow" onClick={() => navigate("/")}>
            ⬅
          </span>
          <h2>Login</h2>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
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

          <label className="remember-box">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
