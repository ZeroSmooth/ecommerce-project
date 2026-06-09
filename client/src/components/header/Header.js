import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../../image/logo.png";
import "./Header.css";
import { usePopup } from "../../assets/popup.js";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showPopup } = usePopup();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  /* =========================
     LOAD USER (COOKIE AUTH)
  ========================= */
  const loadUser = async () => {
    try {
      const res = await fetch(
        "https://ecommerce-project-zpx8.onrender.com/me",
        {
          credentials: "include",
        },
      );

      const data = await res.json();

      setUser(data.loggedIn ? data.user : null);
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  /* =========================
     CART
  ========================= */
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  const currentPath = location.pathname;
  const hideAuthButton =
    currentPath === "/login" || currentPath === "/register";

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    showPopup(
      "Are you sure you want to logout?",
      "warning",
      async () => {
        await fetch("https://ecommerce-project-zpx8.onrender.com/logout", {
          method: "POST",
          credentials: "include",
        });

        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-change"));

        setUser(null);
        navigate("/");
      },
      {
        showCancel: true,
        continueText: "Logout",
        cancelText: "Cancel",
      },
    );
  };

  return (
    <header className="header-glass">
      <div className="header-container">
        {/* LEFT */}
        <div className="header-left">
          <div className="logo-container" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="logo" />
          </div>
        </div>

        {/* SHOP */}
        <button className="shop-button" onClick={() => navigate("/shop")}>
          Shop Now
        </button>

        {/* RIGHT */}
        <div className="header-right">
          {/* CART */}
          <div className="cart-container" onClick={() => navigate("/cart")}>
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>

          {/* USER */}
          {user ? (
            <>
              <span className="welcome-text">Welcome, {user.username}</span>

              {user.role === "admin" && (
                <button
                  className={`admin-button ${
                    currentPath === "/admin" ? "home-button" : ""
                  }`}
                  onClick={() =>
                    currentPath === "/admin"
                      ? navigate("/")
                      : navigate("/admin")
                  }
                >
                  {currentPath === "/admin" ? "🏠 Home" : "⚙️ Admin"}
                </button>
              )}

              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            !hideAuthButton && (
              <button
                className="auth-button"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
