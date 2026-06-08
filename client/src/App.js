import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Admin from "./pages/admin/Admin";
import Insert from "./pages/admin/insert/InsertProduct";
import Shop from "./pages/shop/Shop";
import ProductPage from "./pages/product/ProductPage";
import GCash from "./pages/cart/gcash/GCash";

import Vouchers from "./pages/admin/vouchers/Vouchers";

import Cart from "./pages/cart/cart";
import Buy from "./pages/cart/buy";
import Checkout from "./pages/cart/checkout/checkout";
import PlaceOrder from "./pages/cart/placeorder/placeorder";

import { PopupProvider } from "./assets/popup"; // or popupjs

function App() {
  return (
    <PopupProvider>
      <BrowserRouter>
        <Header />

        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductPage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/insert"
            element={
              <AdminRoute>
                <Insert />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/vouchers"
            element={
              <AdminRoute>
                <Vouchers />
              </AdminRoute>
            }
          />

          {/* Cart */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/placeorder" element={<PlaceOrder />} />
          <Route path="/gcash" element={<GCash />} />
        </Routes>
      </BrowserRouter>
    </PopupProvider>
  );
}

export default App;
