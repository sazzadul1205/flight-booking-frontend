// React
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Tanstack
import { useQuery, useQueryClient } from "@tanstack/react-query";

// API
import { login, register, getProfile, logout as authLogout } from "../api/auth";

export const useAuth = () => {
  // Navigation
  const navigate = useNavigate();

  // Query
  const queryClient = useQueryClient();

  // State
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem("token");

  // Login function
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.invalidateQueries(["profile"]);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      console.error("Login failed:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function - Auto-login after registration
  const handleRegister = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Register the user
      await register(name, email, password);

      // Step 2: Auto-login with the same credentials
      const loginData = await login(email, password);
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));
      queryClient.invalidateQueries(["profile"]);

      // Step 3: Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      console.error("Registration failed:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get profile query (protected)
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: isAuthenticated,
    retry: false,
    onError: () => {
      authLogout();
      navigate("/login");
    },
  });

  // Logout function
  const handleLogout = () => {
    authLogout();
    queryClient.invalidateQueries(["profile"]);
    navigate("/login");
  };

  return {
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    loading,
    error,
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
  };
};
