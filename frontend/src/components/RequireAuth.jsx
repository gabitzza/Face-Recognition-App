import { Navigate } from "react-router-dom";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // dacă nu există token → redirect la login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAuth;
