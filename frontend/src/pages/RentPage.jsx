// src/pages/RentPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaBolt, FaArrowLeft, FaCheck, FaInfoCircle } from "react-icons/fa";
import bydseal from "../assets/bydseal.jpg";
import klara from "../assets/klara.jpg";
import tesla from "../assets/tesla.jpg";
import vf9 from "../assets/vinfast-vf9.jpg";
import vf8 from "../assets/vinfast8.jpg";
import "./admindashboard/AdminNavbar.css";

/* ================== HELPERS ================== */
const endpointsOf = (id) => [
  `http://localhost:8080/api/vehicles/${id}`,
  `http://localhost:8080/vehicles/${id}`,
];

async function fetchVehicleById(id) {
  let lastErr = null;
  for (const url of endpointsOf(id)) {
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Không thể gọi API chi tiết xe");
}

const mapStatus = (raw) => {
  const s = String(raw || "").toUpperCase();
  if (["SOLD_OUT", "OUT_OF_STOCK", "INACTIVE", "MAINTENANCE"].includes(s)) return "soldout";
  return "available";
};

const fallbackImageByType = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("sedan")) return tesla;
  if (t.includes("suv")) return vf9;
  if (t.includes("xe máy") || t.includes("scooter") || t.includes("motor")) return klara;
  if (t.includes("mini")) return vf8;
  return bydseal;
};

const toVND = (n) => Number(n ?? 0).toLocaleString("vi-VN");

/* ================== COMPONENT ================== */
const RentPage = () => {
  // Nhận param theo cả 2 cách để không lệ thuộc tên route
  const { id: idParam, carId: carIdParam } = useParams();
  const vehicleId = idParam || carIdParam; // ví dụ /rent/:id hoặc /rent/:carId
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [activeImg, setActiveImg] = useState(vf8);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tải chi tiết xe theo UUID
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    setCar(null);

    (async () => {
      try {
        const v = await fetchVehicleById(vehicleId);

        // Chuẩn hóa dữ liệu từ BE → view model
        const type = v.type || "Xe điện";
        const img = v.imageUrl || fallbackImageByType(type);
        const mapped = {
          id: v.id || v.vehicleId || vehicleId,
          name: v.name || "Chưa đặt tên",
          img,
          price: v.pricePerDayVnd ?? v.price ?? 0,
          status: mapStatus(v.status),
          type,
          seats: v.seats ?? null,
          trunk: v.trunkLiters != null ? `${v.trunkLiters}L` : "—",
          range: v.rangeKmNEDC != null ? `${v.rangeKmNEDC}km (NEDC)` : v.range ?? "—",
          gearbox: v.gearbox ?? "Tự động",
          power: v.powerHp != null ? `${v.powerHp} HP` : "—",
          airbags: v.airbags ?? 0,
          limit: v.dailyLimitKm != null ? `${v.dailyLimitKm} km/ngày` : "300 km/ngày",
          perks: v.perks ?? ["Miễn phí sạc"],
          features: v.features ?? ["Màn hình giải trí 10”", "La-zăng 16”"],
        };

        if (mounted) {
          setCar(mapped);
          setActiveImg(mapped.img);
        }
      } catch (e) {
        if (mounted) setError(e.message || "Lỗi tải chi tiết xe");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [vehicleId]);

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    document.body.style.overflowX = "hidden";
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflowX = "";
    };
  }, []);

  const THUMBS = useMemo(
    () => (car ? [car.img, vf8, vf9, tesla, bydseal, klara].filter(Boolean) : []),
    [car]
  );
  const isSoldOut = car?.status === "soldout";

  const goBook = () => {
    if (!car || isSoldOut) return;
    navigate(`/booking-form/${car.id}`);
  };

  return (
    <div className="page-frame">
      <style>{`
        :root { --brand:#14452F; --brand-2:#0e3323; --ink:#0f172a; --muted:#64748b; --success:#0b6b3a; --error:#991b1b; --border:#e5e7eb; --bg-light:#f8fafc; }
        * { box-sizing: border-box; }
        .page-frame { display:flex; flex-direction: column; min-height:100vh; background:#fff; position: relative; }
        .admin-navbar .menu-item.active { color:#14452F; font-weight:700; }
        .rent-container { width:100%; max-width:1200px; margin:0 auto; padding:16px 12px 100px; color:var(--ink); flex: 1; }
        @media (min-width:768px){ .rent-container { padding:20px 16px 40px; } }
        .crumb { color:#475569; font-weight:600; font-size:14px; margin-bottom: 16px; display:flex; align-items:center; gap:6px; }
        .link { color:var(--brand); text-decoration:none; display:flex; align-items:center; gap:4px; }
        .link:hover { text-decoration:underline; }
        .rent-grid { display:grid; grid-template-columns:1fr; gap:20px; }
        @media (min-width:900px){ .rent-grid { grid-template-columns:1.1fr .9fr; gap:30px; } }
        .card { background:#fff; border:1px solid var(--border); border-radius:12px; overflow: hidden; }
        .card.pad { padding:16px; }
        .main-img-wrap { position:relative; border-radius:10px; overflow:hidden; background:#f3f4f6; aspect-ratio:16/9; }
        .main-img { width:100%; height:100%; object-fit:cover; display:block; }
        .thumbs { display:flex; gap:10px; margin-top:16px; overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:8px; scrollbar-width: thin; }
        .thumbs::-webkit-scrollbar { height:4px; }
        .thumbs::-webkit-scrollbar-thumb { background:#ccc; border-radius:4px; }
        .thumb { width:80px; height:60px; flex:0 0 auto; object-fit:cover; border-radius:8px; border:2px solid transparent; background:#fff; }
        .thumb-btn { border:none; padding:0; background:transparent; border-radius:8px; line-height:0; cursor:pointer; }
        .thumb-btn:active { transform:scale(.95); }
        .thumb.active { border-color:var(--brand); }
        .info { padding:20px; position:relative; }
        @media (min-width:900px){ .info { position:sticky; top:20px; height: fit-content; } }
        .badges { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
        .badge { padding:6px 12px; border-radius:20px; font-weight:700; font-size:0.85rem; background:#e8f5e9; color:var(--success); border:1px solid #bbf7d0; display:flex; align-items:center; gap:4px; }
        .badge.sold { background:#fee2e2; color:var(--error); border-color:#fecaca; }
        .car-name { font-size:1.5rem; font-weight:900; margin:8px 0 12px; color:#0b1720; line-height:1.3; }
        @media (min-width:768px){ .car-name{ font-size:1.7rem; } }
        .price-row { display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; margin:10px 0 16px; }
        .price { color:var(--brand); font-weight:900; font-size:1.5rem; }
        @media (min-width:768px){ .price{ font-size:1.7rem; } }
        .unit { color:#475569; font-weight:600; font-size:.95rem; }
        .vat { color:#94a3b8; font-weight:500; font-size:.9rem; }
        .chips { display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; margin:16px 0 20px; }
        @media (min-width:480px){ .chips { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width:640px){ .chips { grid-template-columns: repeat(4, 1fr); } }
        .chip { background:var(--bg-light); border:1px solid var(--border); color:#0f172a; padding:12px 10px; border-radius:10px; font-weight:600; font-size:.9rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:4px; }
        .chip-icon { font-size:1.2rem; margin-bottom:4px; }
        .btn { width:100%; padding:16px; border-radius:12px; border:1px solid var(--brand); background:var(--brand); color:#fff; font-weight:700; font-size:1rem; cursor:pointer; display:flex; justify-content:center; align-items:center; gap:8px; transition:all .2s ease; }
        .btn:active { transform: translateY(2px); opacity:.9; }
        .btn[disabled]{ opacity:.6; cursor:not-allowed; }
        .btn.alt { background:#fff; color:var(--brand); }
        .btn-row { display:grid; grid-template-columns:1fr; gap:12px; }
        @media (min-width:520px){ .btn-row{ grid-template-columns:1fr 1fr; } }
        .section { margin-top:24px; }
        .section .card { padding:20px; }
        .section h3 { margin:0 0 16px; font-size:1.2rem; color:var(--brand); display:flex; align-items:center; gap:8px; }
        .section h4 { margin:16px 0 8px; font-size:1rem; color:#0b1720; }
        .list { list-style:none; margin:0; padding:0; }
        .list li { padding:12px 0; border-bottom:1px dashed #e2e8f0; font-size:1rem; display:flex; align-items:flex-start; gap:8px; }
        .list li:last-child{ border-bottom:none; }
        .list-icon { color: var(--brand); flex-shrink:0; margin-top:2px; }
        .hint { margin-top:12px; color:#475569; font-size:.95rem; display:flex; align-items:flex-start; gap:8px; }
        .bar { position:fixed; bottom:0; left:0; right:0; z-index:40; background:#fff; border-top:1px solid var(--border); padding:12px 16px; display:grid; grid-template-columns:1fr 1.2fr; gap:12px; align-items:center; box-shadow:0 -4px 12px rgba(0,0,0,0.05); }
        .bar .bar-price { font-weight:900; color:var(--brand); font-size:1.2rem; }
        .bar .bar-unit { color:var(--muted); font-weight:600; font-size:.9rem; }
        .bar .bar-btn { padding:14px 16px; border-radius:12px; border:1px solid var(--brand); background:var(--brand); color:#fff; font-weight:700; font-size:1rem; cursor:pointer; }
        .bar .bar-btn:active { transform: translateY(2px); opacity:.9; }
        @media (min-width:900px){ .bar { display:none; } }
        .footer { color:#fff; text-align:center; padding:20px 16px; font-weight:500; background:#14452F; margin-top:auto; }
        .error-container { padding:40px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; }
        .evb-error { padding:12px 16px; background:#fee2e2; color:#991b1b; border:1px solid #fecaca; border-radius:10px; margin:12px 0; }
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
        <div className="navbar-user" />
      </nav>

      {/* CONTENT */}
      <main className="rent-container">
        <div className="crumb">
          <Link className="link" to="/">
            <FaArrowLeft size={14} /> Trang chủ
          </Link>
          &nbsp;/&nbsp; Thuê xe &nbsp;/&nbsp; <b>{car?.name || "Đang tải..."}</b>
        </div>

        {error && <div className="evb-error">Không tải được chi tiết xe: {error}</div>}

        {loading && (
          <div className="error-container">
            <h2>Đang tải chi tiết xe…</h2>
          </div>
        )}

        {!loading && !car && !error && (
          <div className="error-container">
            <h2>Không tìm thấy xe!</h2>
            <button onClick={() => navigate('/')} className="btn alt">
              Quay về trang chủ
            </button>
          </div>
        )}

        {!loading && car && (
          <>
            <div className="rent-grid">
              {/* Gallery */}
              <section className="card pad">
                <div className="main-img-wrap">
                  <img className="main-img" src={activeImg} alt={car.name} loading="eager" />
                </div>
                <div className="thumbs" aria-label="Bộ sưu tập ảnh">
                  {THUMBS.map((src, i) => (
                    <button key={i} className="thumb-btn" onClick={() => setActiveImg(src)} aria-label={`Chọn ảnh ${i + 1}`}>
                      <img className={`thumb ${activeImg === src ? "active" : ""}`} src={src} alt={`${car.name} - hình ${i + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Info + CTA */}
              <aside className="card info" role="complementary" aria-label="Thông tin đặt xe">
                <div className="badges">
                  {car.perks?.map((p, i) => (
                    <div key={i} className="badge">
                      <FaCheck size={12} /> {p}
                    </div>
                  ))}
                  <div className={`badge ${isSoldOut ? "sold" : ""}`}>{isSoldOut ? "Hết xe" : "Có sẵn"}</div>
                </div>

                <h1 className="car-name">{car.name}</h1>

                <div className="price-row">
                  <div className="price">{toVND(car.price)} VNĐ</div>
                  <div className="unit">/ngày</div>
                  <div className="vat">(đã gồm VAT)</div>
                </div>

                <div className="chips">
                  <span className="chip"><span className="chip-icon">🚗</span>{car.type}</span>
                  {car.seats && <span className="chip"><span className="chip-icon">👥</span>{car.seats} chỗ</span>}
                  {car.trunk !== "—" && <span className="chip"><span className="chip-icon">🧳</span>Cốp {car.trunk}</span>}
                  {car.range !== "—" && <span className="chip"><span className="chip-icon">🔋</span>{car.range}</span>}
                  <span className="chip"><span className="chip-icon">⚙️</span>{car.gearbox}</span>
                  {car.power !== "—" && <span className="chip"><span className="chip-icon">⚡</span>{car.power}</span>}
                  {car.airbags > 0 && <span className="chip"><span className="chip-icon">🎈</span>{car.airbags} túi khí</span>}
                  {car.limit !== "—" && <span className="chip"><span className="chip-icon">📏</span>{car.limit}</span>}
                </div>

                <div className="btn-row">
                  <button className="btn" onClick={goBook} disabled={isSoldOut} title={isSoldOut ? "Hết xe" : "Đặt xe ngay"}>
                    {isSoldOut ? "Hết xe" : "Đặt xe ngay"}
                  </button>
                  <button className="btn alt" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Quay lại
                  </button>
                </div>

                <p className="hint">
                  <FaInfoCircle /> Sau khi đặt, hệ thống sẽ gửi xác nhận qua email/SMS.
                </p>
              </aside>
            </div>

            {/* Sections */}
            <section className="section">
              <div className="card">
                <h3><FaInfoCircle /> Tiện nghi nổi bật</h3>
                <ul className="list">
                  {(car.features?.length ? car.features : ["Màn hình giải trí 10”", "La-zăng 16”"]).map((f, i) => (
                    <li key={i}><span className="list-icon">•</span> {f}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="section">
              <div className="card">
                <h3><FaInfoCircle /> Điều kiện thuê xe</h3>

                <h4>Thông tin cần có khi nhận xe</h4>
                <ul className="list">
                  <li><span className="list-icon">•</span> CCCD hoặc hộ chiếu còn thời hạn</li>
                  <li><span className="list-icon">•</span> Bằng lái hợp lệ, còn thời hạn</li>
                </ul>

                <h4>Hình thức thanh toán</h4>
                <ul className="list">
                  <li><span className="list-icon">•</span> Trả trước</li>
                  <li><span className="list-icon">•</span> Đặt cọc giữ xe, thanh toán 100% khi ký hợp đồng và nhận xe</li>
                </ul>

                <h4>Chính sách đặt cọc</h4>
                <ul className="list">
                  <li><span className="list-icon">•</span> Số tiền cọc: <b>5.000.000đ</b></li>
                </ul>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Sticky bottom (mobile) */}
      {!loading && car && !isSoldOut && isMobile && (
        <div className="bar" role="region" aria-label="Đặt xe nhanh">
          <div>
            <div className="bar-price">{toVND(car.price)} VNĐ</div>
            <div className="bar-unit">/ngày (VAT)</div>
          </div>
          <button className="bar-btn" onClick={goBook} aria-label="Đặt xe ngay (mobile)">
            Đặt xe ngay
          </button>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer">© 2025 EcoMove. Liên hệ: support@ecomove.com</footer>
    </div>
  );
};

export default RentPage;
