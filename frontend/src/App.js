// src/App.jsx
import React from "react";
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
// ⛳️ Sửa import: đúng tên file BookingForm.jsx
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
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* 🔹 User routes */}
            <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<LoginRegisterPage />} />

            <Route path="/home" element={isLoggedIn ? <HomePage /> : <Navigate to="/login" replace />} />
            <Route path="/dashboard" element={isLoggedIn ? <UserDashboard /> : <Navigate to="/login" replace />} />

            {/* 🚗 Rent detail: bảo vệ và hỗ trợ cả :id lẫn :carId */}
            <Route path="/rent/:id" element={isLoggedIn ? <RentPage /> : <Navigate to="/login" replace />} />
            <Route path="/rent/:carId" element={isLoggedIn ? <RentPage /> : <Navigate to="/login" replace />} />
            {/* Tránh /rent trống → về dashboard */}
            <Route path="/rent" element={<Navigate to="/dashboard" replace />} />

            {/* 📝 Booking form với UUID */}
            <Route path="/booking-form/:vehicleId" element={isLoggedIn ? <BookingForm /> : <Navigate to="/login" replace />} />
            {/* Tránh /booking-form trống */}
            <Route path="/booking-form" element={<Navigate to="/dashboard" replace />} />

            <Route path="/map" element={isLoggedIn ? <MapPage /> : <Navigate to="/login" replace />} />

            {/* 🔹 Admin routes */}
            <Route path="/admin/login" element={<AdminLoginRedirect><AdminLogin /></AdminLoginRedirect>} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

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
