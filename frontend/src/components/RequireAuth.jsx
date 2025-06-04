import { Navigate } from "react-router-dom";

function RequireAuth({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Dacă specifici roluri permise (ex: ['admin']), verifică dacă user-ul e printre ele
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export default RequireAuth;
