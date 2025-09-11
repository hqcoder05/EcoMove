// src/pages/BookingForm.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import "./admindashboard/AdminNavbar.css";

const DEFAULT_CAR = {
  name: "VinFast VF 8",
  img: "https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf8-1-1-1024x426.png",
  price: 1200000, // VND / ngày
  seats: 5,
  range: "≈400km/lần sạc",
  gearbox: "Số tự động",
};

export default function BookingForm() {
  const navigate = useNavigate();

  // form state (controlled)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    pickupDate: "",
    returnDate: "",
    pickupPlace: "",
    note: "",
    agree: false,
  });

  // chặn chọn ngày quá khứ
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  useEffect(() => {
    if (form.pickupDate && form.returnDate && form.returnDate < form.pickupDate) {
      setForm((f) => ({ ...f, returnDate: f.pickupDate }));
    }
  }, [form.pickupDate, form.returnDate]);

  const days = useMemo(() => {
    if (!form.pickupDate || !form.returnDate) return 1;
    const d1 = new Date(form.pickupDate);
    const d2 = new Date(form.returnDate);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) || 0;
    return Math.max(1, diff + 1); // tính cả ngày nhận
  }, [form.pickupDate, form.returnDate]);

  const subtotal = useMemo(() => DEFAULT_CAR.price * days, [days]);
  const vat = useMemo(() => Math.round(subtotal * 0.1), [subtotal]);
  const total = useMemo(() => subtotal + vat, [subtotal, vat]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // kiểm tra tối thiểu
    if (!form.fullName || !form.phone || !form.email || !form.pickupDate || !form.returnDate) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    if (!form.agree) {
      alert("Vui lòng đồng ý điều khoản thuê xe.");
      return;
    }
    // TODO: gửi API tạo booking
    alert("Đặt xe thành công! Chúng tôi sẽ liên hệ xác nhận.");
    navigate("/dashboard");
  };

  return (
    <div className="page-frame">
      <style>{`
        :root { --brand:#14452F; --ink:#0f172a; --muted:#64748b; --line:#e5e7eb; }
        .page-frame { display:grid; grid-template-rows:auto 1fr auto; min-height:100vh; background:#fff; }

        /* ===== Header: dùng lại AdminNavbar.css ===== */
        .admin-navbar .menu-item.active { color:#14452F; font-weight:700; }

        /* ===== Layout ===== */
        .wrap { max-width: 1100px; margin: 0 auto; padding: 16px 12px 100px; }
        @media (min-width: 768px) { .wrap { padding: 24px 16px 48px; } }

        .grid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width: 960px) { .grid { grid-template-columns: 1fr 1fr; gap: 22px; } }

        .card { background:#fff; border:1px solid var(--line); border-radius:16px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .pad { padding:16px; }
        @media (min-width:768px) { .pad { padding:18px; } }

        /* ===== Car summary ===== */
        .title { font-size:1.25rem; font-weight:900; margin:0 0 8px; color:var(--ink); }
        .img-wrap { border-radius:12px; overflow:hidden; background:#f3f4f6; aspect-ratio: 16/9; }
        .img { width:100%; height:100%; object-fit:cover; display:block; }
        .meta { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
        .chip { background:#f8fafc; border:1px solid var(--line); border-radius:12px; padding:8px 10px; font-weight:700; }

        .price-block { display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; margin-top:12px; }
        .price { color:var(--brand); font-weight:900; font-size:1.3rem; }
        .per { color:#475569; font-weight:700; }

        .table { margin-top:10px; border-top:1px dashed var(--line); padding-top:10px; color:var(--ink); }
        .row { display:flex; justify-content:space-between; padding:8px 0; }
        .row.total { border-top:1px solid var(--line); margin-top:4px; padding-top:12px; font-weight:900; }
        .muted { color:var(--muted); }

        /* ===== Form ===== */
        .legend { font-size:1.1rem; font-weight:900; color:var(--brand); margin:0 0 10px; }
        .form { display:grid; grid-template-columns:1fr; gap:12px; }
        .row2 { display:grid; grid-template-columns:1fr; gap:12px; }
        @media (min-width:560px){ .row2 { grid-template-columns:1fr 1fr; } }
        .label { font-weight:800; color:#0b1720; }
        .inp, .area, .sel {
          width:100%; padding:12px; border:1px solid var(--line); border-radius:12px; font-size:1rem; outline:none;
          background:#fff;
        }
        .inp:focus, .area:focus, .sel:focus { border-color:#14452F; box-shadow:0 0 0 3px rgba(20,69,47,.12); }
        .area { min-height:96px; resize:vertical; }

        .agree { display:flex; gap:10px; align-items:flex-start; }
        .agree input { transform: translateY(3px); }

        .btn { width:100%; padding:14px 16px; border-radius:14px; border:1px solid var(--brand); background:var(--brand); color:#fff; font-weight:900; font-size:1rem; }
        .btn:active { transform: translateY(1px); }
        .btn[disabled]{ opacity:.6; }
        .btn.alt { background:#fff; color:var(--brand); }

        /* ===== Sticky Action Bar (mobile) ===== */
        .bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          background: #fff; border-top: 1px solid var(--line); padding: 10px 12px;
          display: grid; grid-template-columns: 1fr 1.2fr; gap: 10px; align-items: center;
        }
        .bar .bar-price { font-weight: 900; color: var(--brand); font-size: 1.1rem; }
        .bar .bar-unit { color: var(--muted); font-weight: 700; font-size: .95rem; }
        .bar .bar-btn { padding: 12px 14px; border-radius: 12px; border:1px solid var(--brand); background: var(--brand); color:#fff; font-weight: 900; font-size: 1rem; }
        .bar .bar-btn:active { transform: translateY(1px); }
        @media (min-width:960px){ .bar { display:none; } } /* desktop ẩn */

        /* ===== Footer ===== */
        .footer { color:#fff; text-align:center; padding:16px; font-weight:500; background:#14452F; }
      `}</style>

      {/* ===== HEADER ===== */}
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

      {/* ===== CONTENT ===== */}
      <main className="wrap">
        <div className="grid">
          {/* Tóm tắt xe */}
          <section className="card pad" aria-label="Thông tin xe đã chọn">
            <h1 className="title">{DEFAULT_CAR.name}</h1>
            <div className="img-wrap" aria-hidden="true">
              <img className="img" src={DEFAULT_CAR.img} alt={DEFAULT_CAR.name} />
            </div>

            <div className="meta">
              <span className="chip">👥 {DEFAULT_CAR.seats} chỗ</span>
              <span className="chip">🔋 {DEFAULT_CAR.range}</span>
              <span className="chip">⚙️ {DEFAULT_CAR.gearbox}</span>
            </div>

            <div className="price-block">
              <div>
                <div className="price">{DEFAULT_CAR.price.toLocaleString("vi-VN")} VNĐ</div>
                <div className="per">/ngày (đã gồm VAT)</div>
              </div>
            </div>

            <div className="table" role="region" aria-label="Tạm tính">
              <div className="row">
                <span className="muted">Số ngày</span>
                <b>{days}</b>
              </div>
              <div className="row">
                <span className="muted">Tạm tính</span>
                <b>{subtotal.toLocaleString("vi-VN")}đ</b>
              </div>
              <div className="row">
                <span className="muted">VAT (10%)</span>
                <b>{vat.toLocaleString("vi-VN")}đ</b>
              </div>
              <div className="row total">
                <span>Tổng cộng</span>
                <b>{total.toLocaleString("vi-VN")}đ</b>
              </div>
            </div>
          </section>

          {/* Form đặt xe */}
          <section className="card pad" aria-label="Form đặt xe">
            <h2 className="legend">Đặt xe ngay</h2>
            <form className="form" onSubmit={onSubmit} noValidate>
              <label className="label">
                Họ và tên
                <input
                  className="inp"
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={onChange}
                  required
                />
              </label>

              <div className="row2">
                <label className="label">
                  Số điện thoại
                  <input
                    className="inp"
                    name="phone"
                    type="tel"
                    placeholder="09xxxxxxxx"
                    value={form.phone}
                    onChange={onChange}
                    pattern="^\\+?\\d{9,15}$"
                    inputMode="tel"
                    required
                  />
                </label>

                <label className="label">
                  Email
                  <input
                    className="inp"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={onChange}
                    required
                  />
                </label>
              </div>

              <div className="row2">
                <label className="label">
                  Ngày nhận xe
                  <input
                    className="inp"
                    name="pickupDate"
                    type="date"
                    min={todayISO}
                    value={form.pickupDate}
                    onChange={onChange}
                    required
                  />
                </label>

                <label className="label">
                  Ngày trả xe
                  <input
                    className="inp"
                    name="returnDate"
                    type="date"
                    min={form.pickupDate || todayISO}
                    value={form.returnDate}
                    onChange={onChange}
                    required
                  />
                </label>
              </div>

              <label className="label">
                Địa điểm nhận xe
                <input
                  className="inp"
                  name="pickupPlace"
                  type="text"
                  placeholder="VD: 214 Nguyễn Đình Chiểu, Quận 3…"
                  value={form.pickupPlace}
                  onChange={onChange}
                />
              </label>

              <label className="label">
                Ghi chú (tuỳ chọn)
                <textarea
                  className="area"
                  name="note"
                  placeholder="Yêu cầu thêm ghế trẻ em, khung giờ linh hoạt…"
                  value={form.note}
                  onChange={onChange}
                />
              </label>

              <label className="agree">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={onChange}
                  aria-label="Đồng ý điều khoản"
                />
                <span>
                  Tôi đồng ý với <Link to="/terms" target="_blank" rel="noreferrer">Điều khoản thuê xe</Link> và{" "}
                  <Link to="/policy" target="_blank" rel="noreferrer">Chính sách bảo mật</Link>.
                </span>
              </label>

              <button className="btn" type="submit" disabled={!form.agree}>
                Xác nhận đặt xe
              </button>
              <button type="button" className="btn alt" onClick={() => navigate(-1)}>
                Quay lại
              </button>
            </form>
          </section>
        </div>
      </main>

      {/* ===== Sticky action bar (mobile) ===== */}
      <div className="bar" role="region" aria-label="Xác nhận nhanh">
        <div>
          <div className="bar-price">{total.toLocaleString("vi-VN")}đ</div>
          <div className="bar-unit">Tổng ({days} ngày)</div>
        </div>
        <button className="bar-btn" onClick={onSubmit} aria-label="Xác nhận đặt xe">
          Xác nhận đặt xe
        </button>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="footer">© 2025 EcoMove. Liên hệ: support@ecomove.com</footer>
    </div>
  );
}
