import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import LoginRegisterPage from "./pages/LoginRegisterPage";

// 🔹 Auth context cho admin
import { AuthProvider } from "./AuthContext";

// 🔹 Admin pages
import AdminDashboard from "./pages/admindashboard/AdminDashboard";

// 🔹 User pages
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard/UserDashboard.jsx";
import HomePage from "./pages/UserDashboard/HomePage.jsx";
import RentPage from "./pages/RentPage";
import MapPage from "./pages/MapPage.jsx";
import BookingForm from "./pages/Bookingform.jsx";
import BookingHistory from "./pages/UserDashboard/BookingHistory.jsx";

// =======================
// Route bảo vệ Admin
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const location = useLocation();

  if (!token || role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminLoginRedirect = ({ children }) => {
  const { isAuthenticated } = React.useContext(require("./AuthContext").AuthContext);
  const location = useLocation();
  if (isAuthenticated === null) return null;
  return isAuthenticated ? <Navigate to="/admin/dashboard" state={{ from: location }} replace /> : children;
};

// =======================

function App() {
  const isAdmin = localStorage.getItem("userRole") === "admin";
  const isLoggedIn = !!localStorage.getItem("token");

  console.log("TOKEN:", localStorage.getItem("token"));
  console.log("isLoggedIn:", isLoggedIn);
  console.log("isAdmin:", isAdmin);


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
            <Route
              path="/rent/:vehicleId"
              element={isLoggedIn ? <RentPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/booking-form/:vehicleId"
              element={isLoggedIn ? <BookingForm /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/map"
              element={isLoggedIn ? <MapPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/history"
              element={isLoggedIn ? <BookingHistory /> : <Navigate to="/login" replace />}
            />

            {/* 🔹 Admin routes */}

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
