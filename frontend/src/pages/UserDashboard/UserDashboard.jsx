import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import EVBookingForm from "./EVBookingForm";
import "../admindashboard/AdminNavbar.css";

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:8080/api/auth/sign-out", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      alert("Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  const handleSearch = (data) => {
    console.log("Tìm xe với thông tin:", data);
    // ví dụ: navigate("/map");
  };

  return (
    <div className="user-dashboard">
      {/* Styles bám theo HomePage */}
      <style>{`
        .user-dashboard {
          font-family: 'Segoe UI', sans-serif;
          background: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        /* Navbar dùng lại class từ AdminNavbar.css để đồng bộ */
        .hero-like {
          text-align: center;
          padding: 60px 20px 30px;
          background: linear-gradient(to right, #14452F, #A5D6A7);
          color: white;
        }
        .hero-like h1 {
          font-size: 2rem;
          margin-bottom: 12px;
          font-weight: 700;
        }
        .hero-like p {
          font-size: 1.05rem;
          opacity: 0.95;
          margin: 0;
        }

        /* Khu vực nội dung chính: canh giữa giống "features" spacing */
        .content-wrap {
          padding: 40px 10%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        /* Card đặt EVBookingForm - kích thước & style tương đương feature-card nhưng rộng hơn chút */
        .booking-card {
          background: #fff;
          width: 100%;
          max-width: 720px;              /* tương quan hợp lý với layout HomePage */
          padding: 30px 24px;
          border-radius: 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 2px solid #14452F;     /* viền giống feature-card */
        }
        .booking-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(0,0,0,0.12);
        }
        .booking-card h2 {
          margin: 0 0 12px;
          font-size: 1.4rem;
          color: #14452F;
        }
        .booking-card p.sub {
          margin: 0 0 18px;
          color: #333;
          font-size: 0.95rem;
        }

        /* Hàng action dưới form (giống cách HomePage có CTA) */
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
        }

        /* Footer giữ cùng style */
        .footer {
          margin-top: auto;
          color: white;
          text-align: center;
          padding: 16px;
          font-weight: 500;
          background-color: #14452F;
        }

        /* Responsive tương tự */
        @media (max-width: 768px) {
          .content-wrap { padding: 30px 6%; }
          .booking-card { padding: 24px 18px; }
          .hero-like { padding: 48px 16px 24px; }
          .hero-like h1 { font-size: 1.6rem; }
        }
      `}</style>

      {/* Navbar (dùng cùng cấu trúc với HomePage để tỉ lệ giống) */}
      <nav className="admin-navbar">
        <div className="navbar-brand">
          <h2><FaBolt style={{ marginRight: "8px", color: "#fbc02d" }} />EcoMove</h2>
        </div>
        <div className="navbar-menu">
          <Link to="/" className="menu-item">Trang chủ</Link>
          <Link to="/dashboard" className="menu-item">Thuê xe</Link>
          <Link to="/map" className="menu-item">Gợi ý trạm sạc</Link>
        </div>
        <div className="navbar-user">
          <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </nav>

      {/* Hero “tương tự” để giữ nhịp layout và màu sắc */}
      <div className="hero-like">
        <h1>Thuê xe điện dễ dàng</h1>
        <p>Nhập thông tin chuyến đi của bạn và chúng tôi sẽ tìm xe phù hợp.</p>
      </div>

      {/* Nội dung chính: form trong card, canh giữa, padding giống khu “features” */}
      <div className="content-wrap">
        <div className="booking-card">
          <h2>Đặt xe</h2>
          <p className="sub">Chọn điểm đón, thời gian và loại xe bạn muốn.</p>

          {/* EVBookingForm giữ nguyên, chỉ truyền handler */}
          <EVBookingForm onSearch={handleSearch} />

          {/* Tuỳ chọn hành động phụ để giữ cân đối giống CTA HomePage */}
          <div className="booking-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/map")}
              title="Xem trạm sạc gần bạn"
            >
              Xem trạm sạc gần bạn
            </button>
            <Link to="/" className="btn-secondary" style={{ textDecoration: "none", display: "inline-block" }}>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>

      {/* Footer giống HomePage */}
      <div className="footer">
        © 2025 EcoMove. Liên hệ: support@ecomove.com
      </div>
    </div>
  );
};

export default UserDashboard;
