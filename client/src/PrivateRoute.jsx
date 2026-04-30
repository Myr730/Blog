import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function PrivateRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/session-info`, {
      method: "GET",
      credentials: "include",
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.id_author) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    })
    .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return <p>Cargando...</p>;
  if (isAuth === false) return <Navigate to="/login" />;
  return children;
}