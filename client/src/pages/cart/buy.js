import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Buy() {
  const navigate = useNavigate();

  useEffect(() => {
    const buyItem = JSON.parse(localStorage.getItem("buyNowItem"));
    if (!buyItem) {
      navigate("/shop");
      return;
    }

    localStorage.setItem("checkoutItems", JSON.stringify([buyItem]));
    localStorage.removeItem("buyNowItem");
    navigate("/checkout");
  }, [navigate]);

  return <div style={{ padding: "40px" }}>Redirecting to checkout...</div>;
}

export default Buy;
