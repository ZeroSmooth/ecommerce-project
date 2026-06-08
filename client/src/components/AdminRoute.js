import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(
          "https://ecommerce-project-zpx8.onrender.com/me",
          {
            credentials: "include",
          },
        );

        const data = await res.json();

        if (data.loggedIn && data.user && data.user.role === "admin") {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
