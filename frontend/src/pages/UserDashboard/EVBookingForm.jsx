import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Ảnh fallback theo loại xe (tuỳ bạn thay sau)
import bydseal from "../../assets/bydseal.jpg";
import klara from "../../assets/klara.jpg";
import tesla from "../../assets/tesla.jpg";
import vf9 from "../../assets/vinfast-vf9.jpg";
import vf8 from "../../assets/vinfast8.jpg";

/* ================== HELPERS ================== */
const tryFetchVehicles = async () => {
  // Thử /api/vehicles trước (phù hợp với các trang khác của bạn),
  // nếu lỗi sẽ fallback sang /vehicles
  const endpoints = [
    "http://localhost:8080/api/vehicles",
    "http://localhost:8080/vehicles",
  ];

  let lastErr = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Không thể gọi được API vehicles");
};

const mapStatus = (raw) => {
  if (!raw) return "available";
  const s = String(raw).toUpperCase();
  if (["AVAILABLE", "ACTIVE", "AVAILABLE_NOW", "READY"].includes(s)) return "available";
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

const toVND = (n) => {
  const x = Number(n ?? 0);
  return x.toLocaleString("vi-VN");
};

/* ================== COMPONENT ================== */
const EVBookingForm = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);      // dữ liệu từ BE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await tryFetchVehicles();

        // Kỳ vọng VehicleResponse có các field (ví dụ):
        // { id (UUID) | vehicleId, name, type, pricePerDayVnd, imageUrl, status, seats, trunkLiters, rangeKmNEDC }
        const mapped = (Array.isArray(data) ? data : []).map((v) => {
          const id = v.id || v.vehicleId; // tuỳ DTO của bạn
          const type = v.type || "Khác";
          const status = mapStatus(v.status);
          const img = v.imageUrl || fallbackImageByType(type);

          // Nếu BE không có các field này, ta ẩn chip tương ứng (null)
          const seats = v.seats ?? null;
          const trunk = v.trunkLiters ? `${v.trunkLiters}L` : null;
          const range =
            v.range || v.rangeKmNEDC
              ? `${v.rangeKmNEDC ?? v.range}km (NEDC)`
              : null;

          return {
            id,
            name: v.name || "Chưa đặt tên",
            price: v.pricePerDayVnd ?? v.price ?? 0,
            badge: "Miễn phí sạc",
            status,
            img,
            type,
            range,
            seats,
            trunk,
          };
        });

        if (mounted) {
          setItems(mapped);
          setError("");
        }
      } catch (e) {
        if (mounted) setError(e.message || "Lỗi tải danh sách xe");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="evb-wrap">
      <style>{`
        :root {
          --brand:#14452F;
          --brand-2:#0e3323;
          --ring:#1b6b48;
        }

        .evb-wrap { padding: 18px 8%; background: #fff; }
        @media (max-width: 1024px){ .evb-wrap{ padding: 16px 6%; } }
        @media (max-width: 640px){ .evb-wrap{ padding: 12px 14px; } }

        .evb-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
        .evb-title { font-size:1.4rem; font-weight:800; color:var(--brand); }
        .evb-legend { font-size:.95rem; color:#475569; }
        @media (max-width: 640px){
          .evb-head { flex-direction:column; align-items:flex-start; }
        }

        .evb-list {
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }
        @media (min-width: 1280px){ .evb-list { gap: 22px; } }

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

        .evb-img-wrap { position:relative; width:100%; aspect-ratio: 16/9; background:#f5f7f9; overflow:hidden; }
        .evb-img { width:100%; height:100%; object-fit:cover; display:block; transform: scale(1.02); transition: transform .35s ease; }
        .evb-card:hover .evb-img { transform: scale(1.06); }

        .evb-grad { position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.45) 100%); pointer-events:none; }

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

        .evb-body { padding: 14px 14px 16px; display:flex; flex-direction:column; gap:10px; }

        .evb-name { font-size:1.06rem; font-weight:800; color:#0f172a; line-height:1.2; }

        .evb-price-row { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
        .evb-price { color: var(--brand); font-weight:900; font-size: 1.24rem; letter-spacing: .2px; }
        .evb-unit { color:#64748b; font-weight:600; font-size:.95rem; }

        .evb-specs { display:flex; gap:10px; flex-wrap:wrap; color:#334155; font-size:.95rem; }
        .chip { background:#f1f5f9; border:1px solid #e5e7eb; color:#0f172a; padding:6px 10px; border-radius:10px; font-weight:600; }

        .evb-actions { display:flex; gap:10px; margin-top:4px; flex-wrap:wrap; }
        .evb-cta {
          flex:1; min-width: 130px;
          padding:10px 14px; border-radius:12px; border:1px solid var(--brand);
          background: var(--brand); color:#fff; font-weight:800; cursor:pointer;
          transition: transform .15s ease, background .15s ease, box-shadow .15s ease;
        }
        .evb-cta:hover { background: var(--brand-2); transform: translateY(-1px); box-shadow: 0 8px 18px rgba(20,69,47,.25); }
        .evb-cta:focus-visible { outline:none; box-shadow: 0 0 0 3px var(--ring); }

        .evb-cta.alt { background:#fff; color: var(--brand); }
        .evb-cta.alt:hover { background:#f8fafc; }

        .muted { color:#64748b; font-weight:600; }

        /* Loading / Error */
        .evb-empty { padding: 16px; color:#64748b; }
        .evb-error { padding: 12px 16px; background:#fee2e2; color:#991b1b; border:1px solid #fecaca; border-radius:10px; margin-bottom:14px; }
      `}</style>

      {/* Header */}
      <div className="evb-head">
        <div>
          <div className="evb-title">Chọn xe điện phù hợp</div>
          <div className="evb-legend">
            Giá đã bao gồm <b>sạc miễn phí</b> và hỗ trợ sự cố 24/7.
          </div>
        </div>
        <button
          className="evb-cta alt"
          onClick={() => navigate("/map")}
          title="Xem trạm sạc gần bạn"
        >
          Xem trạm sạc gần bạn
        </button>
      </div>

      {/* Error */}
      {error && <div className="evb-error">Không tải được danh sách xe: {error}</div>}

      {/* Loading */}
      {loading && <div className="evb-empty">Đang tải danh sách xe…</div>}

      {/* Grid */}
      {!loading && !error && (
        <div className="evb-list">
          {items.length === 0 && (
            <div className="evb-empty">Chưa có xe nào trong hệ thống.</div>
          )}

          {items.map((car) => {
            const isSoldOut = car.status === "soldout";
            return (
              <div
                key={car.id}
                className={`evb-card${isSoldOut ? " soldout" : ""}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (!isSoldOut && (e.key === "Enter" || e.key === " ")) {
                    navigate(`/rent/${car.id}`);
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
                    <div className="evb-price">{toVND(car.price)} VNĐ</div>
                    <div className="evb-unit">/ngày</div>
                    <div className="muted">đã bao gồm VAT</div>
                  </div>

                  <div className="evb-specs">
                    {car.type && <span className="chip">🚗 {car.type}</span>}
                    {car.range && <span className="chip">🔋 {car.range}</span>}
                    {car.seats && <span className="chip">👥 {car.seats} chỗ</span>}
                    {car.trunk && <span className="chip">🧳 Cốp {car.trunk}</span>}
                  </div>

                  <div className="evb-actions">
                    <button
                      className="evb-cta"
                      disabled={isSoldOut}
                      onClick={() => !isSoldOut && navigate(`/rent/${car.id}`)}
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
      )}
    </div>
  );
};

export default EVBookingForm;
