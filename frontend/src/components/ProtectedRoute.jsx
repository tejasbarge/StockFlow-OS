import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If there is no user token/data, redirect heavily to the Login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
