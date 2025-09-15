// src/pages/user/UserDashboard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import EVBookingForm from "./EVBookingForm";
import "../admindashboard/AdminNavbar.css"; // tái sử dụng style navbar

const ROOT_API = "http://localhost:8080/api";
const AUTH_SIGNOUT = `${ROOT_API}/auth/sign-out`;

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(AUTH_SIGNOUT, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
      alert("Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  const handleSearch = (data) => {
    console.log("Tìm xe với thông tin:", data);
  };

  return (
    <div className="user-dashboard">
      <style>{`
        .user-dashboard {
          font-family: 'Segoe UI', sans-serif;
          background: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .hero {
          text-align: center;
          padding: 80px 20px;
          background: linear-gradient(to right, #14452F, #A5D6A7);
          color: white;
        }
        .hero h1 { font-size: 2.2rem; margin-bottom: 12px; font-weight: 700; }
        .hero p  { font-size: 1.1rem; opacity: 0.95; margin: 0; }

        .content-wrap {
          padding: 48px 10%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .booking-card {
          background: #fff;
          width: 100%;
          max-width: 980px;
          padding: 28px 22px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 2px solid #14452F;
        }
        .booking-card h2 {
          margin: 0 0 10px;
          font-size: 1.4rem;
          color: #14452F;
        }
        .booking-card p.sub {
          margin: 0 0 18px;
          color: #333;
          font-size: 0.95rem;
        }

        .booking-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .btn-primary {
          padding: 10px 18px;
          background: #14452F;
          color: #fff;
          border: none;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-secondary {
          padding: 10px 18px;
          background: #ffffff;
          color: #14452F;
          border: 2px solid #14452F;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .footer {
          margin-top: auto;
          background: #14452F;
          color: #ffffff;
          text-align: center;
          padding: 36px 16px;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
        }
      `}</style>

      {/* Navbar */}
      <nav className="admin-navbar">
        <div className="navbar-brand">
          <h2>
            <FaBolt style={{ marginRight: "8px", color: "#fbc02d" }} />
            EcoMove
          </h2>
        </div>
        <div className="navbar-menu">
          <Link to="/" className="menu-item">Trang chủ</Link>
          <Link to="/dashboard" className="menu-item">Thuê xe</Link>
          <Link to="/map" className="menu-item">Gợi ý trạm sạc</Link>
          <Link to="/history" className="menu-item">Lịch sử thuê xe</Link>
        </div>
        <div className="navbar-user">
          <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <h1>Thuê xe điện dễ dàng</h1>
        <p>Nhập thông tin chuyến đi của bạn và chúng tôi sẽ tìm xe phù hợp.</p>
      </div>

      {/* Nội dung */}
      <div className="content-wrap">
        <div className="booking-card">
          <h2>Đặt xe</h2>
          <p className="sub">Chọn điểm đón, thời gian và loại xe bạn muốn.</p>

          <EVBookingForm onSearch={handleSearch} />

          <div className="booking-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/map")}
              title="Xem trạm sạc gần bạn"
            >
              Xem trạm sạc gần bạn
            </button>
            <Link to="/" className="btn-secondary">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">© 2025 EcoMove. Liên hệ: support@ecomove.com</div>
    </div>
  );
};

export default UserDashboard;
