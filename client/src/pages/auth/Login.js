import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePopup } from "../../assets/popup.js";
import API_URL from "../../config/api.js";
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
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!data.success) {
        showPopup(data.message || "Login failed", "error");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
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
      <video autoPlay loop muted playsInline className="auth-video-bg">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      <div className="auth-overlay"></div>

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

          {/* ✅ Remember Me + Forgot Password row */}
          <div className="remember-row">
            <label className="remember-box">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            <Link to="/forgotpassword" className="forgot-link">
              Forgot password?
            </Link>
          </div>

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
