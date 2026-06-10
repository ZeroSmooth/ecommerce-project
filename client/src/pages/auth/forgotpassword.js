import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePopup } from "../../assets/popup.js";
import API_URL from "../../config/api.js";
import backgroundVideo from "../../assets/background.mp4";
import "./style.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const [pin, setPin] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // STEP 1 - SEND CODE
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        showPopup(data.message || "Email not found", "error");
        return;
      }

      showPopup("4-digit code sent to email", "success");
      setStep(2);
    } catch (error) {
      console.log("Fetch error:", error);
      showPopup("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 - VERIFY CODE
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          code: pin,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        showPopup(data.message || "Invalid code", "error");
        return;
      }

      showPopup("Code verified", "success");
      setStep(3);
    } catch (error) {
      console.log(error);
      showPopup("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 - RESET PASSWORD (UNCHANGED LOGIC)
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showPopup("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showPopup("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });

      const data = await response.json();

      if (!data.success) {
        showPopup(data.message || "Reset failed", "error");
        return;
      }

      showPopup("Password reset! Please log in.", "success");
      navigate("/login");
    } catch (error) {
      console.log("Fetch error:", error);
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
          <span className="back-arrow" onClick={() => navigate("/login")}>
            ⬅
          </span>
          <h2>Forgot Password</h2>
        </div>

        {/* STEP 1 - EMAIL */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleEmailSubmit}>
            <p className="auth-hint">
              Enter your account email and we'll send a reset code.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        )}

        {/* STEP 2 - PIN */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleVerifyCode}>
            <p className="auth-hint">
              Enter the 4-digit code sent to <strong>{email}</strong>
            </p>

            <input
              type="text"
              placeholder="4-digit code"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {/* STEP 3 - PASSWORD */}
        {step === 3 && (
          <form className="auth-form" onSubmit={handlePasswordReset}>
            <p className="auth-hint">
              Choose a new password for <strong>{email}</strong>
            </p>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="auth-link">
          Remembered it? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
