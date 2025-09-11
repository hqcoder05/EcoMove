import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import LoginRegisterPage from "./pages/LoginRegisterPage";

// 🔹 Auth context cho admin
import { AuthProvider } from "./AuthContext";

// 🔹 Admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admindashboard/AdminDashboard";

// 🔹 User pages
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard/UserDashboard.jsx";
import HomePage from "./pages/UserDashboard/HomePage.jsx";
import RentPage from "./pages/RentPage";
import MapPage from "./pages/MapPage.jsx";
import BookingForm from "./pages/Bookingform.jsx";

// =======================
// Route bảo vệ Admin
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(require("./AuthContext").AuthContext);
  const location = useLocation();
  if (isAuthenticated === null) return null;
  return isAuthenticated ? children : <Navigate to="/admin/login" state={{ from: location }} replace />;
};

const AdminLoginRedirect = ({ children }) => {
  const { isAuthenticated } = React.useContext(require("./AuthContext").AuthContext);
  const location = useLocation();
  if (isAuthenticated === null) return null;
  return isAuthenticated ? <Navigate to="/admin/dashboard" state={{ from: location }} replace /> : children;
};
// =======================

function App() {
  // Kiểm tra quyền cho user
  const isAdmin = localStorage.getItem("userRole") === "admin";
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* 🔹 User routes */}
            {/* Trang mặc định: Luôn chuyển về trang login */}
            <Route
              path="/"
              element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />}
            />

            {/* Trang đăng nhập & đăng ký */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<LoginRegisterPage />} />
            <Route
              path="/home"
              element={isLoggedIn ? <HomePage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/dashboard"
              element={isLoggedIn ? <UserDashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/rent"
              element={isLoggedIn ? <RentPage /> : <Navigate to="/login" replace />}
            />
            <Route path="/rent/:carId" element={<RentPage />} />
            <Route
              path="/booking-form"
              element={isLoggedIn ? <BookingForm /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/map"
              element={isLoggedIn ? <MapPage /> : <Navigate to="/login" replace />}
            />

            {/* 🔹 Admin routes */}
            <Route
              path="/admin/login"
              element={<AdminLoginRedirect><AdminLogin /></AdminLoginRedirect>}
            />
            <Route
              path="/admin/dashboard"
              element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>}
            />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h1>404 - Không tìm thấy trang</h1>
                  <p>Trang bạn đang tìm kiếm không tồn tại.</p>
                  <button onClick={() => window.history.back()}>← Quay lại</button>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
