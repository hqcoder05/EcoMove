// src/pages/BookingForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import "./admindashboard/AdminNavbar.css";

const toVND = (n) => Number(n ?? 0).toLocaleString("vi-VN");

const fetchVehicleDetail = async (id) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const urls = [
    `http://localhost:8080/api/vehicles/${id}`,
    `http://localhost:8080/vehicles/${id}`,
  ];

  let lastErr;
  for (const u of urls) {
    try {
      const res = await fetch(u, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Không thể lấy thông tin xe");
};

const BookingForm = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams(); // /booking-form/:vehicleId
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    pickupTime: "",
    returnTime: "",
    pickupArea: "",
    returnArea: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!vehicleId) return;
      try {
        setLoading(true);
        const data = await fetchVehicleDetail(vehicleId);

        // Map BE -> ViewModel (ẩn chip nếu thiếu)
        const mapped = {
          id: data.id || data.vehicleId || vehicleId,
          name: data.name || "Chưa đặt tên",
          image: data.imageUrl || "/images/default-car.jpg",
          price: data.pricePerDayVnd ?? data.price ?? 0,
          type: data.type || "Xe điện",
          seats: data.seats ?? "-",
          range:
            data.rangeKmNEDC != null
              ? `${data.rangeKmNEDC}km (NEDC)`
              : data.range ?? "-",
          trunk:
            data.trunkLiters != null ? `${data.trunkLiters}L` : "-",
        };
        if (mounted) setVehicle(mapped);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin xe:", error);
        alert("Không thể tải thông tin xe");
        navigate("/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [vehicleId, navigate]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=vi`
      );
      if (!response.ok) throw new Error("Không thể lấy địa chỉ");
      const data = await response.json();
      const address = data.address || {};
      let formatted = "";
      if (address.house_number) formatted += address.house_number + " ";
      if (address.road) formatted += address.road + ", ";
      if (address.suburb || address.neighbourhood)
        formatted += (address.suburb || address.neighbourhood) + ", ";
      if (address.city_district || address.county)
        formatted += (address.city_district || address.county) + ", ";
      if (address.city || address.town)
        formatted += address.city || address.town;
      return formatted || data.display_name;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `Vĩ độ: ${lat.toFixed(6)}, Kinh độ: ${lng.toFixed(6)}`;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const address = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          setFormData((prev) => ({ ...prev, pickupArea: address }));
        } catch (e) {
          alert("Không thể lấy địa chỉ từ vị trí hiện tại");
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        let message = "Không thể lấy vị trí hiện tại";
        if (error.code === error.PERMISSION_DENIED)
          message = "Bạn đã từ chối quyền truy cập vị trí";
        else if (error.code === error.POSITION_UNAVAILABLE)
          message = "Thông tin vị trí không khả dụng";
        else if (error.code === error.TIMEOUT)
          message = "Yêu cầu lấy vị trí hết thời gian";
        alert(message);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để đặt xe.");
      navigate("/login");
      return;
    }
    try {
      const payload = { ...formData, vehicleId: vehicle?.id ?? vehicleId };
      const res = await fetch("http://localhost:8080/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Đặt xe thành công!");
        navigate("/history");
      } else {
        let serverMsg = "";
        try {
          serverMsg = (await res.json()).message;
        } catch {
          serverMsg = await res.text();
        }
        alert(serverMsg || `HTTP ${res.status}: Đặt xe thất bại`);
      }
    } catch (error) {
      console.error("Lỗi khi kết nối backend:", error);
      alert("Lỗi kết nối server");
    }
  };

  return (
    <div className="booking-page">
      <style>{`
        .booking-page {
          font-family: 'Segoe UI', sans-serif;
          background:#fff;
          min-height:100vh;
          display:flex;
          flex-direction:column;
        }
        /* Navbar đồng bộ AdminNavbar.css */
        .hero-like {
          text-align:center;
          padding: 60px 20px 30px;
          background: linear-gradient(to right, #14452F, #A5D6A7);
          color: #fff;
        }
        .hero-like h1 { font-size: 2rem; margin: 0 0 8px; font-weight: 700; }
        .hero-like p { font-size: 1.05rem; opacity: .95; margin: 0; }
        .content-wrap {
          padding: 40px 10%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .card {
          background:#fff;
          border-radius:16px;
          border:2px solid #14452F;
          box-shadow:0 4px 10px rgba(0,0,0,.08);
          transition: .2s ease;
        }
        .card:hover { transform: translateY(-2px); box-shadow:0 8px 18px rgba(0,0,0,.12); }
        .car-summary { padding: 22px; text-align:center; }
        .car-img { width:100%; height:auto; border-radius:10px; margin-bottom:14px; }
        .car-title { font-size:22px; margin: 6px 0 8px; color:#14452F; }
        .car-price { color:#0b6b3a; font-weight:900; font-size:18px; margin-bottom: 10px; }
        .car-info { list-style:none; padding:0; margin:0; color:#333; }
        .car-info li { margin:6px 0; font-size: 15px; }
        .booking-card { padding: 24px; }
        .booking-card h2 { margin:0 0 12px; font-size:1.4rem; color:#14452F; }
        .booking-card p.sub { margin:0 0 18px; color:#333; font-size:.95rem; }
        .booking-form form { display:flex; flex-direction:column; gap:15px; }
        .booking-form label { display:flex; flex-direction:column; font-weight:700; color:#333; }
        .booking-form input {
          padding:10px; margin-top:6px;
          border:1px solid #ccc; border-radius:8px; outline:none;
        }
        .booking-form input:focus { border:1px solid #14452F; }
        .form-row { display:flex; gap:15px; }
        .booking-actions { display:flex; gap:12px; margin-top:16px; flex-wrap:wrap; }
        .btn-primary {
          padding:10px 18px; background:#14452F; color:#fff; border:none;
          border-radius:999px; font-weight:600; cursor:pointer;
        }
        .btn-secondary {
          padding:10px 18px; background:#fff; color:#14452F;
          border:2px solid #14452F; border-radius:999px; font-weight:600; cursor:pointer;
          text-decoration:none; display:inline-block;
        }
        .submit-btn {
          background: linear-gradient(45deg, #007bff, #00c6ff);
          color:#fff; padding:12px; border:none; border-radius:8px;
          cursor:pointer; font-size:16px; font-weight:700;
        }
        .footer {
          margin-top:auto; color:#fff; text-align:center; padding:16px;
          font-weight:500; background:#14452F;
        }
        @media (max-width: 900px) {
          .content-wrap { grid-template-columns: 1fr; padding: 30px 6%; }
          .form-row { flex-direction: column; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="admin-navbar">
        <div className="navbar-brand">
          <h2><FaBolt style={{ marginRight: 8, color: "#fbc02d" }} />EcoMove</h2>
        </div>
        <div className="navbar-menu">
          <Link to="/" className="menu-item">Trang chủ</Link>
          <Link to="/dashboard" className="menu-item">Thuê xe</Link>
          <Link to="/map" className="menu-item">Gợi ý trạm sạc</Link>
        </div>
        <div className="navbar-user">
          <button
            className="logout-btn"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                await fetch("http://localhost:8080/api/auth/sign-out", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                });
              } catch {}
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero-like">
        <h1>Đặt xe điện dễ dàng</h1>
        <p>{vehicle ? `Xe bạn chọn: ${vehicle.name}` : "Nhập thông tin chuyến đi của bạn."}</p>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div style={{ padding: "24px", textAlign: "center" }}>Đang tải thông tin xe…</div>
      ) : !vehicle ? (
        <div style={{ padding: "24px", textAlign: "center" }}>
          Không tìm thấy thông tin xe.{" "}
          <button className="btn-secondary" onClick={() => navigate("/dashboard")}>Về danh sách xe</button>
        </div>
      ) : (
        <div className="content-wrap">
          {/* TÓM TẮT XE */}
          <section className="card car-summary">
            <img
              className="car-img"
              src={vehicle.image}
              alt={vehicle.name}
              onError={(e) => { e.currentTarget.src = "/images/default-car.jpg"; }}
            />
            <h2 className="car-title">{vehicle.name}</h2>
            <p className="car-price">{toVND(vehicle.price)} VNĐ / ngày</p>
            <ul className="car-info">
              <li>🚗 {vehicle.type}</li>
              {vehicle.seats && <li>👥 {vehicle.seats}</li>}
              {vehicle.range && <li>⚡ {vehicle.range}</li>}
              {vehicle.trunk && <li>🧳 Cốp {vehicle.trunk}</li>}
              <li>🔑 Số tự động</li>
            </ul>
            <div className="booking-actions" style={{ justifyContent: "center" }}>
              <button className="btn-primary" onClick={() => navigate("/map")}>Xem trạm sạc gần bạn</button>
              <Link to="/dashboard" className="btn-secondary">Về danh sách xe</Link>
            </div>
          </section>

          {/* FORM ĐẶT XE */}
          <section className="card booking-card booking-form">
            <h2>Đặt xe</h2>
            <p className="sub">Chọn điểm đón, thời gian và thông tin liên hệ.</p>

            <form onSubmit={handleSubmit}>
              <label>
                Họ và tên
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nhập họ tên của bạn"
                  required
                />
              </label>

              <label>
                Số điện thoại
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="example@email.com"
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Ngày nhận xe
                  <input
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleChange}
                    type="date"
                    required
                  />
                </label>

                <label>
                  Ngày trả xe
                  <input
                    name="returnTime"
                    value={formData.returnTime}
                    onChange={handleChange}
                    type="date"
                    required
                  />
                </label>
              </div>

              <label>
                Địa điểm nhận xe
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <input
                    name="pickupArea"
                    value={formData.pickupArea}
                    onChange={handleChange}
                    type="text"
                    placeholder="Nhập địa chỉ hoặc dùng vị trí hiện tại"
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="btn-primary"
                    style={{ borderRadius: 8 }}
                  >
                    {gettingLocation ? "Đang lấy…" : "📍 Vị trí hiện tại"}
                  </button>
                </div>
              </label>

              <label>
                Địa điểm trả xe
                <input
                  name="returnArea"
                  value={formData.returnArea}
                  onChange={handleChange}
                  type="text"
                  placeholder="Hiệp Bình Chánh, Thủ Đức, TP.HCM..."
                />
              </label>

              <button type="submit" className="submit-btn">Xác nhận đặt xe</button>
            </form>
          </section>
        </div>
      )}

      {/* FOOTER */}
      <div className="footer">© 2025 EcoMove. Liên hệ: support@ecomove.com</div>
    </div>
  );
};

export default BookingForm;
