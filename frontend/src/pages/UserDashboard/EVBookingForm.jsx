import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import bydseal from '../../assets/bydseal.jpg';
import klara from '../../assets/klara.jpg';
import tesla from '../../assets/tesla.jpg';
import vf9 from '../../assets/vinfast-vf9.jpg';
import vf8 from '../../assets/vinfast8.jpg';
import { FaBolt, FaUser } from "react-icons/fa";

const carData = [
  {
    name: "VinFast VF 3",
    price: 590000,
    badge: "Miễn phí sạc",
    status: "available",
    img: vf8,
    type: "Minicar",
    range: "210km (NEDC)",
    seats: 4,
    trunk: "285L"
  },
  {
    name: "VinFast VF 6 Plus",
    price: 1250000,
    badge: "Miễn phí sạc",
    status: "soldout",
    img: vf9,
    type: "B-SUV",
    range: "460km (NEDC)",
    seats: 5,
    trunk: "423L"
  },
  {
    name: "Tesla Model 3",
    price: 1100000,
    badge: "Miễn phí sạc",
    status: "available",
    img: tesla,
    type: "Sedan",
    range: "480km (NEDC)",
    seats: 5,
    trunk: "423L"
  },
  {
    name: "BYD Seal",
    price: 980000,
    badge: "Miễn phí sạc",
    status: "available",
    img: bydseal,
    type: "Sedan",
    range: "500km (NEDC)",
    seats: 5,
    trunk: "430L"
  },
  {
    name: "VinFast Klara",
    price: 350000,
    badge: "Miễn phí sạc",
    status: "available",
    img: klara,
    type: "Xe máy điện",
    range: "120km (NEDC)",
    seats: 2,
    trunk: "20L"
  }
];

const tabs = [
  { label: "Thuê ngày", value: "ngay" },
  { label: "Thuê tháng", value: "thang" },
  { label: "Thuê năm", value: "nam" }
];

const EVBookingForm = () => {
  const [activeTab, setActiveTab] = useState("ngay");
  const [city, setCity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const navigate = useNavigate();

  const handleSearchCar = (e) => {
    e.preventDefault();
  };

  const handleSearchStation = (e) => {
    e.preventDefault();
    navigate("/map");
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: 0 }}>
      <style>{`
  /* ===== NAVBAR ===== */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #14452F; /* xanh lá cây */
    padding: 12px 24px;
    color: white;
    border-radius: 0 0 12px 12px;
  }
  .navbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    font-size: 1.2rem;
  }
  .navbar-menu {
    display: flex;
    gap: 12px;
  }
  .navbar-menu button {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.5);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  }
  .navbar-menu button:hover {
    background: rgba(255,255,255,0.2);
  }
  .navbar-menu button.active {
    background: white;
    color: #1976d2; /* xanh biển */
  }
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .navbar-right span {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.95rem;
  }
  .navbar-right button {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.6);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    cursor: pointer;
  }

  /* ===== CSS CŨ CỦA FORM ===== */
  .gf-container { max-width: 1200px; margin: 0 auto; padding: 32px 16px; }
  .gf-tabs { display: flex; gap: 16px; margin-bottom: 24px; }
  .gf-tab { padding: 10px 32px; border: none; background: #fff; color: #222; font-weight: 600; font-size: 1.1rem; border-radius: 8px 8px 0 0; border-bottom: 3px solid transparent; cursor: pointer; }
  .gf-tab.active { background: #A5D6A7; color: #fff; border-bottom: 3px solid #A5D6A7; }
  .gf-filter-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; background: #fff; padding: 24px 16px; border-radius: 12px; margin-bottom: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .gf-filter-row label { font-size: 0.95rem; color: #333; margin-right: 4px; display: flex; flex-direction: column; gap: 6px; min-width: 160px; }
  .gf-filter-row input, .gf-filter-row select { padding: 10px 12px; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; margin-top: 2px; }
  .gf-btn-search { background: #A5D6A7; color: #fff; border: none; border-radius: 8px; padding: 12px 32px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .gf-btn-search:hover { background: #A5D6A7; } /* xanh biển đậm hơn khi hover */
  .gf-car-list { display: flex; flex-wrap: wrap; gap: 32px; justify-content: flex-start; }
  .gf-car-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); width: 350px; padding: 0 0 18px 0; position: relative; overflow: hidden; display: flex; flex-direction: column; }
  .gf-car-badge { position: absolute; top: 18px; left: 18px; background: #A5D6A7; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 0.95rem; font-weight: 500; z-index: 2; }
  .gf-car-badge.soldout { background: #ff6b6b; }
  .gf-car-img { width: 100%; height: 180px; object-fit: cover; border-radius: 12px 12px 0 0; }
  .gf-car-content { padding: 18px 18px 0 18px; flex: 1; }
  .gf-car-price { color: #14452F; font-size: 1.3rem; font-weight: bold; }
  .gf-car-title { font-size: 1.15rem; font-weight: 600; margin: 8px 0 6px 0; }
  .gf-car-info { display: flex; gap: 16px; font-size: 0.98rem; color: #444; margin-top: 8px; }
  .gf-car-info span { display: flex; align-items: center; gap: 4px; }
  @media (max-width: 900px) {
    .gf-car-list { flex-direction: column; align-items: center; }
    .gf-car-card { width: 98vw; max-width: 370px; }
  }
`}</style>


      {/* === Thanh navbar === */}
      <div className="navbar">
        <div className="navbar-left">
          <FaBolt style={{ marginRight: '8px', color: '#fbc02d' }} />EcoMove
        </div>
        <div className="navbar-menu">
          <button onClick={() => navigate("/")}>Trang chủ</button>
          <button onClick={() => navigate("/dashboard")}>Xe Điện</button>
          <button onClick={() => navigate("/map")}>Trạm sạc</button>
          
        </div>
        <div className="navbar-right">
          <span><FaUser /> BIKE User</span>
          <button onClick={() => navigate("/Login")}>Đăng Nhập</button>
        </div>
      </div>

      {/* === Nội dung cũ của form === */}
      <div className="gf-container">
        {/* Tabs */}
        {/* <div className="gf-tabs">
          {tabs.map(tab => (
            <button
              key={tab.value}
              className={`gf-tab${activeTab === tab.value ? " active" : ""}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div> */}

        {/* Bộ lọc */}
        {/* <form className="gf-filter-row" onSubmit={handleSearchCar}>
          <label>
            Tỉnh/Thành phố
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="">Chọn tỉnh/Thành phố</option>
              
              <option value="TP HCM">TP HCM</option>
            </select>
          </label>
          <label>
            Ngày nhận xe
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </label>
          <label>
            Giờ nhận xe
            <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} />
          </label>
          <label>
            Ngày trả xe
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </label>
          <label>
            Giờ trả xe
            <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} />
          </label>
          <button className="gf-btn-search" type="submit">
            Tìm kiếm xe
          </button>
          
        </form> */}

        {/* Danh sách xe */}
        <div className="gf-car-list">
          {carData.map((car, idx) => (
            <div
              className="gf-car-card"
              key={idx}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/rent/${idx}`)}
            >
              <div className={`gf-car-badge${car.status === "soldout" ? " soldout" : ""}`}>
                {car.status === "soldout" ? "Hết xe" : car.badge}
              </div>
              <img src={car.img} alt={car.name} className="gf-car-img" />
              <div className="gf-car-content">
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>Chỉ từ </span>
                  <span className="gf-car-price">
                    {car.price.toLocaleString()} VNĐ/Ngày
                  </span>
                </div>
                <div className="gf-car-title">{car.name}</div>
                <div className="gf-car-info">
                  <span>🚗 {car.type}</span>
                  <span>🔋 {car.range}</span>
                </div>
                <div className="gf-car-info">
                  <span>👥 {car.seats} chỗ</span>
                  <span>🧳 Dung tích cốp {car.trunk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EVBookingForm;
