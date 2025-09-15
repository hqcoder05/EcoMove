import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCar, FaChargingStation, FaUser, FaBolt } from "react-icons/fa";
import "../admindashboard/AdminNavbar.css";

/** API roots */
const ROOT_API = "http://localhost:8080/api";
const AI_API   = `${ROOT_API}/ai`;

// Bulk predict cho tất cả trạm (giờ kế tiếp)
const PREDICT_ALL_NEXT = `${AI_API}/predict/next-hour/all`;

// Logout
const AUTH_SIGNOUT = `${ROOT_API}/auth/sign-out`;

const HomePage = () => {
  const navigate = useNavigate();

  const [loadingPredict, setLoadingPredict] = useState(false);
  const [predictions, setPredictions] = useState([]); // [{district, avgDemand, count}]
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

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

  // Tính giờ kế tiếp để hiển thị tiêu đề
  const nextHourInfo = () => {
    const now = new Date();
    const next = new Date(now.getTime() + 60 * 60 * 1000);
    const hour = next.getHours();
    const dayOfWeek = next.toLocaleDateString("en-US", { weekday: "long" });
    return { hour, dayOfWeek };
  };

  // Gọi 1 API duy nhất: /api/ai/predict/next-hour/all
  // Sau đó gộp theo district, tính trung bình predicted_demand
  const loadPredictions = async () => {
    setLoadingPredict(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(PREDICT_ALL_NEXT, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) throw new Error(`Predict-all HTTP ${r.status}`);
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error("Payload không phải mảng");

      // Chuẩn hóa record trạm
      const rows = data
        .map((it) => ({
          district:
            it.district ?? it.districtName ?? it.quan ?? it.quanHuyen ?? it.area ?? "",
          predicted:
            typeof it.predicted_demand === "number"
              ? it.predicted_demand
              : typeof it.predicted_demand === "string"
              ? Number(it.predicted_demand)
              : null,
        }))
        .filter((x) => x.district && typeof x.predicted === "number" && !Number.isNaN(x.predicted));

      // Gộp theo district
      const groups = new Map();
      for (const r of rows) {
        const key = r.district.trim();
        if (!groups.has(key)) groups.set(key, { district: key, sum: 0, count: 0 });
        const g = groups.get(key);
        g.sum += r.predicted;
        g.count += 1;
      }

      // Tính trung bình & sort desc
      const results = Array.from(groups.values())
        .map((g) => ({
          district: g.district,
          avgDemand: g.count ? g.sum / g.count : null,
          count: g.count,
        }))
        .filter((g) => typeof g.avgDemand === "number")
        .sort(
          (a, b) =>
            (b.avgDemand ?? Number.NEGATIVE_INFINITY) -
            (a.avgDemand ?? Number.NEGATIVE_INFINITY)
        );

      setPredictions(results);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
      setError(e.message || "Không thể tải dự báo");
    } finally {
      setLoadingPredict(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  const { hour, dayOfWeek } = nextHourInfo();
  const topN = 8;
  const displayList = predictions.slice(0, topN);

  return (
    <div className="homepage">
      <style>{`
        .homepage {
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
        .hero h1 { font-size: 2.5rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; margin-bottom: 30px; }
        .hero button {
          padding: 12px 28px;
          font-size: 1.1rem;
          background: white;
          color: #1d7fa3;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 600;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          padding: 50px 10%;
        }
        .feature-card {
          background: white;
          padding: 30px 20px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 2px solid #14452F;
        }
        .feature-card h3 { margin-top: 16px; font-size: 1.2rem; color: #14452F; }
        .feature-card p { font-size: 0.95rem; margin-top: 8px; color: #333; }

        /* Prediction section */
        .predict-wrap { padding: 20px 10%; margin-top: -20px; margin-bottom: 30px; }
        .predict-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .predict-title { font-size: 1.4rem; font-weight: 700; color: #14452F; }
        .predict-meta { font-size: 0.95rem; color: #444; }
        .predict-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .predict-card { border: 1px solid #e0e0e0; border-radius: 14px; padding: 16px; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
        .predict-name { font-weight: 700; color: #14452F; margin-bottom: 6px; }
        .predict-row { display: flex; justify-content: space-between; font-size: 0.95rem; margin: 6px 0; }
        .predict-chip { display: inline-block; padding: 2px 10px; border-radius: 999px; background: #e8f5e9; border: 1px solid #a5d6a7; font-weight: 600; }
        .predict-cta { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
        .predict-btn { border: 0; background: #14452F; color: #fff; padding: 8px 12px; border-radius: 10px; cursor: pointer; }
        .predict-btn:disabled { opacity: .7; cursor: not-allowed; }
        .predict-empty { text-align: center; color: #666; padding: 16px; }

        /* FOOTER — dài hơn */
        .footer {
          margin-top: auto;
          background: #14452F;
          color: #ffffff;
          text-align: center;
          padding: 36px 16px;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .footer {
            padding: 48px 20px;
            min-height: 180px;
          }
        }
      `}</style>

      {/* Navbar (lấy từ bản bạn thích) */}
      <nav className="admin-navbar">
        <div className="navbar-brand">
          <h2><FaBolt style={{ marginRight: "8px", color: "#fbc02d" }} />EcoMove</h2>
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
        <h1>Chào mừng đến với EcoMove</h1>
        <p>Thuê xe điện và tìm trạm sạc dễ dàng, nhanh chóng và tiện lợi.</p>
        <Link to="/dashboard">
          <button>🚗 Đặt xe ngay</button>
        </Link>
      </div>

      {/* Features */}
      <div className="features">
        <div className="feature-card">
          <FaCar size={40} color="#14452F" />
          <h3>Thuê xe điện</h3>
          <p>Lựa chọn xe máy điện hoặc ô tô điện phù hợp với nhu cầu của bạn.</p>
        </div>
        <div className="feature-card">
          <FaChargingStation size={40} color="#14452F" />
          <h3>Gợi ý trạm sạc</h3>
          <p>Xem vị trí trạm sạc gần bạn và theo dõi số chỗ trống còn lại.</p>
        </div>
        <div className="feature-card">
          <FaUser size={40} color="#14452F" />
          <h3>Quản lý tài khoản</h3>
          <p>Theo dõi lịch sử đặt xe và cập nhật thông tin cá nhân dễ dàng.</p>
        </div>
      </div>

      {/* Prediction Section (TRUNG BÌNH THEO QUẬN) */}
      <section className="predict-wrap">
        <div className="predict-header">
          <div className="predict-title">
            Dự báo trung bình theo quận giờ tới ({dayOfWeek}, {String(hour).padStart(2, "0")}:00)
          </div>
          <div className="predict-meta">
            {lastUpdated ? `Cập nhật: ${lastUpdated.toLocaleTimeString()}` : "Chưa cập nhật"}
          </div>
        </div>

        <div className="predict-cta">
          <button className="predict-btn" onClick={loadPredictions} disabled={loadingPredict}>
            {loadingPredict ? "Đang tính..." : "Làm mới dự báo"}
          </button>
          {error && <span style={{ color: "#d32f2f", marginLeft: 8 }}>{error}</span>}
        </div>

        {loadingPredict && !predictions.length ? (
          <div className="predict-empty">Đang dự báo theo quận...</div>
        ) : !predictions.length ? (
          <div className="predict-empty">Chưa có dữ liệu dự báo theo quận.</div>
        ) : (
          <div className="predict-grid">
            {displayList.map((it) => (
              <div className="predict-card" key={it.district}>
                <div className="predict-name">{it.district}</div>
                <div className="predict-row">
                  <span>Số trạm tính</span>
                  <span>{it.count}</span>
                </div>
                <div className="predict-row">
                  <span>Nhu cầu dự báo TB</span>
                  <span className="predict-chip">
                    {typeof it.avgDemand === "number" ? it.avgDemand.toFixed(2) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="footer">
        © 2025 EcoMove. Liên hệ: support@ecomove.com
      </div>
    </div>
  );
};

export default HomePage;
