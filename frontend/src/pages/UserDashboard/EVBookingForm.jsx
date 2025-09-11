import React from "react";
import { useNavigate } from "react-router-dom";
import bydseal from "../../assets/bydseal.jpg";
import klara from "../../assets/klara.jpg";
import tesla from "../../assets/tesla.jpg";
import vf9 from "../../assets/vinfast-vf9.jpg";
import vf8 from "../../assets/vinfast8.jpg";

/* ================== DỮ LIỆU MẪU ================== */
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
    trunk: "285L",
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
    trunk: "423L",
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
    trunk: "423L",
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
    trunk: "430L",
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
    trunk: "20L",
  },
];

/* ================== COMPONENT ================== */
const EVBookingForm = () => {
  const navigate = useNavigate();

  return (
    <div className="evb-wrap">
      <style>{`
        :root {
          --brand:#14452F;
          --brand-2:#0e3323;
          --ring:#1b6b48;
        }

        /* ===== Section container ===== */
        .evb-wrap {
          padding: 18px 8%;
          background: #fff;
        }
        @media (max-width: 1024px){ .evb-wrap{ padding: 16px 6%; } }
        @media (max-width: 640px){ .evb-wrap{ padding: 12px 14px; } }

        /* ===== Section header ===== */
        .evb-head {
          display:flex; align-items:center; justify-content:space-between;
          gap:12px; margin-bottom:16px;
        }
        .evb-title {
          font-size:1.4rem; font-weight:800; color:var(--brand);
        }
        .evb-legend {
          font-size:.95rem; color:#475569;
        }
        @media (max-width: 640px){
          .evb-head { flex-direction:column; align-items:flex-start; }
        }

        /* ===== Grid ===== */
        .evb-list {
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }
        @media (min-width: 1280px){ .evb-list { gap: 22px; } }

        /* ===== Card ===== */
        .evb-card {
          background:#fff; border-radius:16px; overflow:hidden;
          border: 1px solid #e6e7ea;
          box-shadow: 0 3px 12px rgba(0,0,0,.06);
          display:flex; flex-direction:column;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
          outline: none;
        }
        .evb-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(0,0,0,.12); }
        .evb-card:focus-visible { box-shadow: 0 0 0 3px var(--ring); border-color: var(--ring); }

        .evb-card.soldout { opacity:.8; }
        .evb-card.soldout .evb-cta { pointer-events:none; opacity:.7; }

        /* ===== Image area ===== */
        .evb-img-wrap {
          position:relative; width:100%; aspect-ratio: 16/9; background:#f5f7f9;
          overflow:hidden;
        }
        .evb-img {
          width:100%; height:100%; object-fit:cover; display:block; transform: scale(1.02);
          transition: transform .35s ease;
        }
        .evb-card:hover .evb-img { transform: scale(1.06); }

        /* Gradient overlay for readability */
        .evb-grad {
          position:absolute; inset:0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.45) 100%);
          pointer-events:none;
        }

        /* Badges */
        .evb-ribbon {
          position:absolute; top:12px; left:12px;
          background:#22c55e; color:#fff; font-weight:700; font-size:.88rem;
          padding:6px 10px; border-radius:999px; box-shadow:0 3px 10px rgba(0,0,0,.15);
        }
        .evb-state {
          position:absolute; top:12px; right:12px;
          padding:6px 10px; border-radius:999px; font-weight:700; font-size:.88rem;
          color:#fff; box-shadow:0 3px 10px rgba(0,0,0,.15);
          background: var(--brand);
        }
        .evb-state.sold { background:#ef4444; }

        /* ===== Body ===== */
        .evb-body { padding: 14px 14px 16px; display:flex; flex-direction:column; gap:10px; }

        .evb-name {
          font-size:1.06rem; font-weight:800; color:#0f172a; line-height:1.2;
        }

        .evb-price-row {
          display:flex; align-items:baseline; gap:10px; flex-wrap:wrap;
        }
        .evb-price {
          color: var(--brand);
          font-weight:900; font-size: 1.24rem;
          letter-spacing: .2px;
        }
        .evb-unit { color:#64748b; font-weight:600; font-size:.95rem; }

        .evb-specs {
          display:flex; gap:10px; flex-wrap:wrap; color:#334155; font-size:.95rem;
        }
        .chip {
          background:#f1f5f9; border:1px solid #e5e7eb; color:#0f172a;
          padding:6px 10px; border-radius:10px; font-weight:600;
        }

        /* CTA row */
        .evb-actions {
          display:flex; gap:10px; margin-top:4px; flex-wrap:wrap;
        }
        .evb-cta {
          flex:1; min-width: 130px;
          padding:10px 14px; border-radius:12px; border:1px solid var(--brand);
          background: var(--brand); color:#fff; font-weight:800; cursor:pointer;
          transition: transform .15s ease, background .15s ease, box-shadow .15s ease;
        }
        .evb-cta:hover { background: var(--brand-2); transform: translateY(-1px); box-shadow: 0 8px 18px rgba(20,69,47,.25); }
        .evb-cta:focus-visible { outline:none; box-shadow: 0 0 0 3px var(--ring); }

        .evb-cta.alt {
          background:#fff; color: var(--brand);
        }
        .evb-cta.alt:hover { background:#f8fafc; }

        /* Small helpers */
        .muted { color:#64748b; font-weight:600; }
      `}</style>

      {/* Header */}
      <div className="evb-head">
        <div>
          <div className="evb-title">Chọn xe điện phù hợp</div>
          <div className="evb-legend">Giá đã bao gồm <b>sạc miễn phí</b> và hỗ trợ sự cố 24/7.</div>
        </div>
        <button
          className="evb-cta alt"
          onClick={() => navigate("/map")}
          title="Xem trạm sạc gần bạn"
        >
          Xem trạm sạc gần bạn
        </button>
      </div>

      {/* Grid */}
      <div className="evb-list">
        {carData.map((car, idx) => {
          const isSoldOut = car.status === "soldout";

          return (
            <div
              key={idx}
              className={`evb-card${isSoldOut ? " soldout" : ""}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (!isSoldOut && (e.key === "Enter" || e.key === " ")) {
                  navigate(`/rent/${idx}`);
                }
              }}
              aria-label={`${car.name} - ${isSoldOut ? "Hết xe" : "Có sẵn"}`}
            >
              {/* Image */}
              <div className="evb-img-wrap">
                <img className="evb-img" src={car.img} alt={car.name} loading="lazy" />
                <div className="evb-grad" />

                <div className="evb-ribbon">{isSoldOut ? "Hết xe" : car.badge}</div>
                <div className={`evb-state ${isSoldOut ? "sold" : ""}`}>
                  {isSoldOut ? "Sold out" : "Có sẵn"}
                </div>
              </div>

              {/* Body */}
              <div className="evb-body">
                <div className="evb-name">{car.name}</div>

                <div className="evb-price-row">
                  <div className="evb-price">
                    {car.price.toLocaleString("vi-VN")} VNĐ
                  </div>
                  <div className="evb-unit">/ngày</div>
                  <div className="muted">đã bao gồm VAT</div>
                </div>

                <div className="evb-specs">
                  <span className="chip">🚗 {car.type}</span>
                  <span className="chip">🔋 {car.range}</span>
                  <span className="chip">👥 {car.seats} chỗ</span>
                  <span className="chip">🧳 Cốp {car.trunk}</span>
                </div>

                <div className="evb-actions">
                  <button
                    className="evb-cta"
                    disabled={isSoldOut}
                    onClick={() => !isSoldOut && navigate(`/rent/${idx}`)}
                    aria-disabled={isSoldOut}
                    title={isSoldOut ? "Hết xe" : `Thuê ${car.name}`}
                  >
                    {isSoldOut ? "Hết xe" : "Thuê ngay"}
                  </button>

                  <button
                    className="evb-cta alt"
                    onClick={() => navigate("/map")}
                    title="Xem trạm sạc lân cận"
                  >
                    Trạm sạc gần
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EVBookingForm;
