import { createContext, useState, useEffect } from "react";
import { register, login, logout } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state to prevent flickering on refresh

  useEffect(() => {
    // Check if user is already logged in on initial app load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const loginUser = async (userData) => {
    const data = await login(userData);
    setUser(data);
  };

  const registerUser = async (userData) => {
    const data = await register(userData);
    setUser(data);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, registerUser, logoutUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
