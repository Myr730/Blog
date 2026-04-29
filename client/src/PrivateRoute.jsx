import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/session-info", {
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