import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem("accessToken");
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem("accessToken");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
