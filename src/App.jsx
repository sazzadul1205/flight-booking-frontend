// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MarkupCommissionManagement from "./pages/MarkupCommissionManagement";
import FlightSearch from "./pages/FlightSearch";
import Layout from "./Layout/Layout";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <FlightSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/config"
          element={
            <ProtectedRoute>
              <MarkupCommissionManagement />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/search" />} />
      </Routes>
    </Router>
  );
};

export default App;