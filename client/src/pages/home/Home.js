import React from "react";
import { Link } from "react-router-dom";
import backgroundVideo from "../../assets/background.mp4";
import "../../assets/videoBackground.css";
import "./Home.css";
import rtx1 from "./img/rtx1.png";
import omen1 from "./img/omen1.png";
import ParallaxSection from "./ParallaxSection";
import proart1 from "./img/proart1.png";

function Home() {
  const products = [
    {
      id: 1,
      name: "Gaming Beast RTX 4090",
      slug: "59-rtx-4090",
      price: "₱95,000",
      image: rtx1,
      category: "Graphics Cards",
    },
    {
      id: 2,
      name: "HP Omen 16",
      slug: "90-hp-omen-16",
      price: "₱80,000",
      image: omen1,
      category: "Laptop",
    },
    {
      id: 3,
      name: "ASUS ProArt Monitor",
      slug: "4-asus-proart-monitor",
      price: "₱20,000",
      image: proart1,
      category: "Monitor",
    },
  ];

  const categories = [
    { name: "Graphics Card", icon: "🎮", color: "#54A0FF" },
    { name: "PC Case", icon: "🖥", color: "#54A0FF" },
    { name: "Keyboard", icon: "⌨️", color: "#54A0FF" },
    { name: "Mouse", icon: "🖱️", color: "#54A0FF" },
    { name: "Joystick Controller", icon: "🎮", color: "#54A0FF" },
    { name: "Headphone", icon: "🎧", color: "#54A0FF" },
    { name: "Monitor", icon: "🖥️", color: "#54A0FF" },
    { name: "Laptop", icon: "💻", color: "#54A0FF" },
    { name: "Power Bank", icon: "🔋", color: "#54A0FF" },
    { name: "Gaming Chair", icon: "💺", color: "#54A0FF" },
  ];

  return (
    <div className="home-wrapper">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Hero */}
      <ParallaxSection>
        <section className="hero-section section-card">
          <div className="hero-content">
            <h1 className="hero-title">
              Upgrade Your <span className="highlight">Gaming</span> Setup
            </h1>
            <p className="hero-subtitle">
              Discover the latest gaming gear with cutting-edge performance.
            </p>
            <Link to="/shop" className="cta-button">
              Shop Now
            </Link>
          </div>
        </section>
      </ParallaxSection>

      {/* Products */}
      <ParallaxSection>
        <section className="products-section section-card">
          <div className="container">
            <h2 className="section-title">Featured Products</h2>

            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    <div className="product-badge">{product.category}</div>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="product-price">{product.price}</div>
                    <Link
                      to={`/product/${product.slug}`}
                      className="product-link"
                    >
                      View Product →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-cta">
              <Link to="/shop" className="shop-now-button">
                Explore All Products →
              </Link>
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* Categories */}
      <ParallaxSection>
        <section className="categories-section section-card">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">
                Find exactly what you're looking for
              </p>
            </div>

            <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="category-card"
                  style={{ "--category-color": category.color }}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* ✅ FIXED FOOTER (NO section-card) */}
      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>E-Commerce Project</h3>
              <p>Your one-stop shop for premium gaming hardware.</p>
            </div>

            <div className="footer-links">
              <div>
                <h4>Shop Categories</h4>

                <Link
                  to="/shop?category=Graphics%20Card"
                  className="footer-link"
                >
                  Graphics Card
                </Link>

                <Link to="/shop?category=Keyboard" className="footer-link">
                  Keyboard
                </Link>

                <Link to="/shop?category=Mouse" className="footer-link">
                  Mouse
                </Link>

                <Link to="/shop?category=Monitor" className="footer-link">
                  Monitor
                </Link>

                <Link to="/shop?category=Laptop" className="footer-link">
                  Laptop
                </Link>
              </div>

              <div>
                <h4>Contact Us</h4>
                <p>Email: ecommerce@gmail.com</p>
                <p>Contact Number: 09389864442</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 E-Commerce Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
