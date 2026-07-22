// src/components/Layout.jsx
import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

import LoginModal from "../Modal/LoginModal";
import SignUpModal from "../Modal/SignUpModal";
import { useAuth } from "../hooks/useAuth";

const Layout = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const { profile, logout, isAuthenticated } = useAuth();

  const isLoggedIn = !!profile || isAuthenticated;

  const handleLogout = () => {
    logout();
  };

  // Helper function for NavLink className
  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? "text-blue-600 font-semibold transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full"
      : "text-black/80 hover:text-black font-medium transition-colors";
  };

  return (
    <div className="min-h-screen relative">
      {/* Navbar - Absolute, floats over content */}
      <nav className="px-6 md:px-5 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
              ✈️
            </div>
            <h1 className="text-black text-2xl font-bold tracking-tight">
              Sazz<span className="text-blue-300">Air</span>
            </h1>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/search" className={getNavLinkClass}>
              Flight Search
            </NavLink>

            {/* Only show Markup Settings when logged in */}
            {isLoggedIn && (
              <NavLink to="/config" className={getNavLinkClass}>
                Markup Settings
              </NavLink>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-black/90 font-medium">
                  Welcome, {profile?.data?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow-xl hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 shadow-xl hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal
          setIsLoginModalOpen={setIsLoginModalOpen}
          setIsSignUpModalOpen={setIsSignUpModalOpen}
        />
      )}

      {isSignUpModalOpen && (
        <SignUpModal
          setIsLoginModalOpen={setIsLoginModalOpen}
          setIsSignUpModalOpen={setIsSignUpModalOpen}
        />
      )}
    </div>
  );
};

export default Layout;
