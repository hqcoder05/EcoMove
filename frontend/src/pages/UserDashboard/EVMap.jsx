// src/pages/UserDashboard/EVMap.jsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaBolt, FaBars, FaCrosshairs } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../admindashboard/AdminNavbar.css";

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE = "http://localhost:8080/api";

// ====== Icons ======
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});
const chargerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3103/3103446.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15);
  }, [position, map]);
  return null;
}

function getDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ============== helpers ============== */
function extractAiIdReasonMetrics(aiJson) {
  if (!aiJson || typeof aiJson !== "object") return { id: null, reason: null, metrics: null };
  const id = aiJson.tram_de_xuat ?? aiJson["tram_de_xuat"] ?? aiJson.id ?? null;
  const reason = aiJson.ly_do ?? aiJson["ly_do"] ?? aiJson.reason ?? null;
  const metrics = aiJson.thong_so ?? aiJson["thong_so"] ?? aiJson.metrics ?? null;
  return { id, reason, metrics };
}

const normalizeStations = (rows) =>
  (rows ?? [])
    .map((r, idx) => {
      const id = r.stationId ?? r.station_id ?? r.id ?? idx + 1;
      const name = r.stationName ?? r.station_name ?? r.name ?? `Station ${idx + 1}`;
      const district = r.district ?? r.quan ?? "";
      const lat = Number(r.lat ?? r.latitude);
      const lon = Number(r.lon ?? r.longitude ?? r.lng);

      const total = Number(r.totalSlots ?? r.total_slots ?? r.capacity);
      const occupied = Number(r.occupiedSlots ?? r.occupied ?? r.in_use ?? r.inuse ?? r.busy);
      const available = Number(r.availableSlots ?? r.available_slots ?? r.free);

      let remaining = null;
      if (Number.isFinite(total) && Number.isFinite(occupied)) {
        remaining = Math.max(0, Math.min(total, total - occupied));
      } else if (Number.isFinite(available)) {
        remaining = available;
      }

      return {
        id, name, district, lat, lon,
        totalSlots: Number.isFinite(total) ? total : null,
        occupiedSlots: Number.isFinite(occupied) ? occupied : null,
        availableSlots: Number.isFinite(available) ? available : null,
        remainingSlots: Number.isFinite(remaining) ? remaining : null,
        driveKm: null,
        driveMin: null,
      };
    })
    .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lon));

/* ============== Backend calls ============== */
async function fetchStations(userPos, opts = { onlyAvailable: true }) {
  const { onlyAvailable } = opts;
  if (userPos && Number.isFinite(userPos[0]) && Number.isFinite(userPos[1])) {
    try {
      const qs = new URLSearchParams({
        lat: String(userPos[0]),
        lng: String(userPos[1]),
        limit: "50",
        onlyAvailable: String(!!onlyAvailable),
        usePostgis: "true",
      }).toString();
      const res = await fetch(`${API_BASE}/stations/nearby?${qs}`, { cache: "no-store" });
      if (res.ok) return normalizeStations(await res.json());
      console.warn("GET /stations/nearby failed:", res.status, await res.text());
    } catch (err) {
      console.error("Nearby fetch error:", err);
    }
  }
  const res = await fetch(`${API_BASE}/stations?page=0&size=100`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const page = await res.json();
  const rows = Array.isArray(page) ? page : page?.content;
  return normalizeStations(rows);
}

async function fetchStationByIdHydrate(id, userPos) {
  // Có thể mở rộng nearby radius lớn nếu cần, nhưng ở đây ưu tiên trang /stations
  const r2 = await fetch(`${API_BASE}/stations?page=0&size=100`, { cache: "no-store" });
  if (r2.ok) {
    const page = await r2.json();
    const rows = normalizeStations(page?.content ?? page);
    return rows.find((s) => String(s.id) === String(id)) || null;
  }
  return null;
}

async function fetchAiSuggestion(userPos) {
  const body = { user_location: { lat: userPos[0], lon: userPos[1] } };
  const res = await fetch(`${API_BASE}/ai/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

/** OSRM table: tính time/distance 1 -> N (nhanh hơn gọi /route nhiều lần) */
async function fetchOsrmTable(userPos, stations) {
  if (!userPos || !stations?.length) return [];
  try {
    const coords = [`${userPos[1]},${userPos[0]}`, ...stations.map(s => `${s.lon},${s.lat}`)].join(";");
    const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const durations = data.durations?.[0] || []; // giây
    const distances = data.distances?.[0] || []; // mét
    return stations.map((s, i) => ({
      id: s.id,
      driveMin: Number.isFinite(durations[i + 1]) ? +(durations[i + 1] / 60).toFixed(1) : null,
      driveKm: Number.isFinite(distances[i + 1]) ? +(distances[i + 1] / 1000).toFixed(2) : null,
    }));
  } catch (e) {
    console.warn("OSRM table failed:", e);
    return [];
  }
}

/* ============== Component ============== */
export default function EVMap() {
  const [userPos, setUserPos] = useState(null);
  const [stations, setStations] = useState([]);
  const [route, setRoute] = useState([]);
  const [search, setSearch] = useState("");
  const [flyPos, setFlyPos] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState("");
  const [aiStation, setAiStation] = useState(null);
  const [aiError, setAiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [sortBy, setSortBy] = useState("driveMin");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fix for mobile view - force remap when sidebar toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  // ===== load vị trí + trạm
  const loadStations = useCallback(async (lat, lon, opts = {}) => {
    setLoading(true);
    try {
      const data = await fetchStations([lat, lon], { onlyAvailable, ...opts });
      setStations(data);
      setError("");
      if (!activeId && data.length) setActiveId(data[0].id);
    } catch (e) {
      setError(`Fetch stations failed: ${e.message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeId, onlyAvailable]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        setUserPos([latitude, longitude]);
        await loadStations(latitude, longitude);
      },
      async () => {
        const lat = 10.7769, lon = 106.7009; // HCM default
        setUserPos([lat, lon]);
        await loadStations(lat, lon);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [loadStations]);

  // auto refresh 60s
  useEffect(() => {
    if (!userPos) return;
    const t = setInterval(() => loadStations(userPos[0], userPos[1]), 60000);
    return () => clearInterval(t);
  }, [userPos, loadStations]);

  // reload khi filter thay đổi
  useEffect(() => {
    if (!userPos) return;
    loadStations(userPos[0], userPos[1]);
  }, [onlyAvailable, loadStations, userPos]);

  // AI suggest
  useEffect(() => {
    const run = async () => {
      if (!userPos) return;
      try {
        const aiJson = await fetchAiSuggestion(userPos);
        const { id: aiId, reason, metrics } = extractAiIdReasonMetrics(aiJson);
        if (!aiId) { setAiStation(null); return; }
        let found = stations.find((s) => String(s.id) === String(aiId));
        if (!found) found = await fetchStationByIdHydrate(aiId, userPos);
        if (found) setAiStation({ ...found, reason, metrics, _fromAi: true });
        else setAiStation({ id: aiId, name: "AI Suggested Station", reason, metrics, _fromAi: true });
        setAiError("");
      } catch (e) {
        setAiError(`AI suggest failed: ${e.message}`);
        console.error(e);
      }
    };
    run();
  }, [userPos, stations]);

  // OSRM table
  useEffect(() => {
    const run = async () => {
      if (!userPos || stations.length === 0) return;
      const results = await fetchOsrmTable(userPos, stations);
      if (!results.length) return;
      setStations(prev => prev.map(s => {
        const hit = results.find(r => String(r.id) === String(s.id));
        return hit ? { ...s, driveKm: hit.driveKm, driveMin: hit.driveMin } : s;
      }));
    };
    run();
  }, [userPos, stations.length]);

  const nearest = useMemo(() => {
    if (!userPos || !stations.length) return null;
    let best = null, dist = Infinity;
    for (const s of stations) {
      const d = getDistance(userPos, [s.lat, s.lon]);
      if (d < dist) { dist = d; best = s; }
    }
    return { station: best, distance: dist };
  }, [userPos, stations]);

  const filtered = useMemo(() => {
    let rows = stations;
    const kw = search.trim().toLowerCase();
    if (kw) {
      rows = rows.filter(s =>
        s.name.toLowerCase().includes(kw) || (s.district || "").toLowerCase().includes(kw)
      );
    }
    rows = [...rows].sort((a, b) => {
      if (sortBy === "driveMin") {
        const av = a.driveMin ?? Number.POSITIVE_INFINITY;
        const bv = b.driveMin ?? Number.POSITIVE_INFINITY;
        return av - bv;
      }
      if (sortBy === "driveKm") {
        const av = a.driveKm ?? Number.POSITIVE_INFINITY;
        const bv = b.driveKm ?? Number.POSITIVE_INFINITY;
        return av - bv;
      }
      if (sortBy === "remaining") {
        const av = a.remainingSlots ?? -1;
        const bv = b.remainingSlots ?? -1;
        return bv - av;
      }
      return String(a.name).localeCompare(String(b.name), "vi");
    });
    return rows;
  }, [search, stations, sortBy]);

  const panTo = (s) => {
    if (s.lat == null || s.lon == null) return;
    setActiveId(s.id);
    setFlyPos([s.lat, s.lon]);
  };

  const drawRoute = async (s) => {
    if (!userPos || !s || s.lat == null || s.lon == null) return;
    const url = `https://router.project-osrm.org/route/v1/driving/${userPos[1]},${userPos[0]};${s.lon},${s.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.length) {
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      setRoute(coords);
      setFlyPos([s.lat, s.lon]);
    }
  };

  const openGmaps = (s) => {
    if (!s?.lat || !s?.lon) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}`, "_blank");
  };

  const useCurrentLocation = () => {
    if (!userPos) return;
    loadStations(userPos[0], userPos[1]);
    setFlyPos(userPos);
  };

  // Fix for map initialization on mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page">
      <style>{`
        /* ===== page frame (không hero, kiểu app) ===== */
        .page { display:grid; grid-template-rows:auto 1fr; min-height:100vh; background:#fff; }
        /* dùng lại AdminNavbar.css để đồng bộ */
        .topbar {
          display:flex; align-items:center; gap:12px;
          padding:10px 12px; border-bottom:1px solid #e5e7eb; background:#f9fafb;
        }
        .topbar .btn { padding:8px 12px; }
        .layout {
          display:grid; grid-template-columns:360px 1fr; height:calc(100vh - 64px);
        }
        .sidebar {
          padding:12px; border-right:1px solid #eee; background:#fff; overflow:auto;
        }
        .mapwrap { position:relative; height: 100%; }
        .map-toolbar {
          position:absolute; top:10px; left:10px; z-index:500; display:flex; gap:8px;
        }

        /* ===== Buttons: luôn xanh mặc định ===== */
        .btn {
          padding:8px 12px; border-radius:8px; border:1px solid #14452F;
          background:#14452F; color:#fff; cursor:pointer; font-weight:600;
        }
        .btn-outline {
          background:#fff; color:#14452F;
        }
        .btn.small { padding:6px 10px; font-size:13px; }
        .inp, select {
          padding:8px; border:1px solid #e5e7eb; border-radius:8px; font-size:14px; background:#fff;
        }
        .badge { font-size:12px; padding:2px 6px; border-radius:6px; }
        .b-green { background:#dcfce7; color:#065f46; }
        .b-orange { background:#fff7ed; color:#9a3412; }
        .b-red { background:#fee2e2; color:#991b1b; }
        .stationCard { border:1px solid #e5e7eb; border-radius:10px; padding:10px; background:#fff; }
        .stationCard.active { border:2px solid #2563eb; background:#f0f6ff; }
        .aiCard { border:2px solid #16a34a; background:#f0fff4; border-radius:10px; padding:10px; }

        /* Fix for mobile view */
        .leaflet-container {
          height: 100%;
          width: 100%;
          z-index: 1;
        }

        @media (max-width: 1024px) {
          .layout { 
            grid-template-columns: 1fr;
            position: relative;
          }
          .sidebar {
            position: absolute;
            z-index: 600;
            width: 84vw;
            max-width: 420px;
            height: 100%;
            border-right: 1px solid #eee;
            box-shadow: 0 8px 24px rgba(0,0,0,.12);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .map-toolbar {
            flex-direction: column;
          }
        }

        @media (max-width: 768px) {
          .topbar {
            flex-wrap: wrap;
          }
          .topbar > div:nth-child(2) {
            margin-left: 0;
            margin-top: 8px;
            width: 100%;
            order: 3;
          }
        }
      `}</style>

      {/* Navbar đồng bộ Home/Admin */}
      <nav className="admin-navbar">
        <div className="navbar-brand">
          <h2><FaBolt style={{ marginRight: "8px", color: "#fbc02d" }} />EcoMove</h2>
        </div>
        <div className="navbar-menu">
          <Link to="/" className="menu-item">Trang chủ</Link>
          <Link to="/dashboard" className="menu-item">Thuê xe</Link>
          <Link to="/map" className="menu-item active">Gợi ý trạm sạc</Link>
        </div>
        <div className="navbar-user" />
      </nav>

      {/* Thanh công cụ nhỏ trên map (không phải hero) */}
      <div className="topbar">
        <button className="btn btn-outline" onClick={() => setSidebarOpen(v => !v)}>
          {/* <FaBars style={{ marginRight: 6 }} />
          {sidebarOpen ? "Ẩn danh sách" : "Hiện danh sách"} */}
        </button>
        <div style={{ fontWeight: 700, color: "#14452F", marginLeft: '12px' }}>Bản đồ trạm sạc</div>
      </div>

      {/* Main layout */}
      <div className="layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <h3 style={{ margin: "6px 0 12px", textAlign: "center", color: "#14452F" }}>Trạm sạc</h3>

          <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="inp" placeholder="Tìm theo tên/quận" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button className="btn btn-outline" onClick={() => setSearch("")}>Xoá</button>
              <button className="btn" onClick={() => userPos && loadStations(userPos[0], userPos[1])}>🔄</button>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
              Chỉ hiển thị trạm còn chỗ
            </label>

            <select className="inp" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="driveMin">Sắp xếp: Thời gian lái xe</option>
              <option value="driveKm">Sắp xếp: Khoảng cách lái xe</option>
              <option value="remaining">Sắp xếp: Slots còn lại</option>
              <option value="name">Sắp xếp: Tên</option>
            </select>

            <button className="btn" onClick={useCurrentLocation}>
              <FaCrosshairs style={{ marginRight: 6 }} />
              Làm mới vị trí hiện tại
            </button>
          </div>

          {loading && <div style={{ padding: 8, background: "#f3f4f6", borderRadius: 8, fontSize: 13 }}>Đang tải trạm…</div>}
          {error && <div style={{ background: "#ffefef", color: "#a00", padding: 8, borderRadius: 6, marginBottom: 10 }}>{error}</div>}

          {/* AI Suggestion */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: "#14452F" }}>Trạm tiềm năng nhất (AI)</div>
            {aiError && <div style={{ background: "#ffefef", color: "#a00", padding: 8, borderRadius: 6, marginBottom: 10 }}>{aiError}</div>}
            {aiStation ? (
              <div onClick={() => panTo(aiStation)} className="aiCard" style={{ cursor: "pointer", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong>{aiStation.name}</strong>
                </div>
                {aiStation.reason && (
                  <div style={{ fontSize: 12, color: "#065f46", background: "#ecfdf5", padding: "6px 8px", borderRadius: 6, marginTop: 6 }}>
                    {aiStation.reason}
                  </div>
                )}
                <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>{aiStation.district || "-"}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                  Slots còn lại: {aiStation.remainingSlots ?? aiStation.availableSlots ?? "-"} / {aiStation.totalSlots ?? "-"}
                </div>
                {aiStation.metrics && (
                  <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>
                    {aiStation.metrics.khoang_cach_km != null && <div>Khoảng cách: {aiStation.metrics.khoang_cach_km} km</div>}
                    {aiStation.metrics.thoi_gian_di_chuyen_phut != null && <div>Di chuyển: {aiStation.metrics.thoi_gian_di_chuyen_phut} phút</div>}
                    {aiStation.metrics.so_slot_trong != null && <div>Slot trống: {aiStation.metrics.so_slot_trong}</div>}
                    {aiStation.metrics.thoi_gian_cho != null && <div>Thời gian chờ: {aiStation.metrics.thoi_gian_cho} phút</div>}
                  </div>
                )}
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn small" onClick={(e) => { e.stopPropagation(); panTo(aiStation); }}>Xem trên bản đồ</button>
                  <button className="btn small" onClick={(e) => { e.stopPropagation(); openGmaps(aiStation); }}>Google Maps</button>
                  <button className="btn small" onClick={(e) => { e.stopPropagation(); drawRoute(aiStation); }}>Tìm đường</button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#666" }}>Đang tính gợi ý…</div>
            )}
          </div>

          {/* Stations list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 24 }}>
            {filtered.map((s) => {
              const isNearest = nearest?.station?.id === s.id;
              const isActive = activeId === s.id;

              const ratio = (s.remainingSlots ?? 0) / (s.totalSlots || 1);
              let badgeCls = "b-green", badgeText = "Còn nhiều";
              if ((s.remainingSlots ?? 0) === 0) { badgeCls = "b-red"; badgeText = "Hết chỗ"; }
              else if (ratio < 0.2) { badgeCls = "b-orange"; badgeText = "Sắp hết"; }

              return (
                <div key={s.id} className={`stationCard ${isActive ? "active" : ""}`} onClick={() => panTo(s)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "baseline", justifyContent: "space-between", flexWrap: 'wrap' }}>
                    <strong>{s.name}</strong>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span className={`badge ${badgeCls}`}>{badgeText}</span>
                      {isNearest && <span className="badge b-green" style={{ background: "#e6ffed", color: "#0b8a3a" }}>Gần nhất</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#555" }}>{s.district || "-"}</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Slots còn lại: <b>{s.remainingSlots ?? s.availableSlots ?? "-"}</b> / {s.totalSlots ?? "-"}
                    </div>
                    <div style={{ fontSize: 12, color: "#444" }}>
                      {s.driveMin != null ? `~${s.driveMin} phút` : (s.driveKm != null ? `~${s.driveKm} km` : "")}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn small" onClick={(e) => { e.stopPropagation(); panTo(s); }}>Xem trên bản đồ</button>
                    <button className="btn small" onClick={(e) => { e.stopPropagation(); drawRoute(s); }}>Tìm đường</button>
                    <button className="btn small" onClick={(e) => { e.stopPropagation(); openGmaps(s); }}>Google Maps</button>
                  </div>
                </div>
              );
            })}
            {!filtered.length && <div>Không có trạm nào khớp tìm kiếm.</div>}
          </div>
        </aside>

        {/* Map */}
        <div className="mapwrap">
          {/* nút mở menu (mobile) */}
          <div className="map-toolbar">
            <button className="btn btn-outline" onClick={() => setSidebarOpen(v => !v)}>
              <FaBars style={{ marginRight: 6 }} /> {sidebarOpen ? "Ẩn danh sách" : "Hiện danh sách"}
            </button>
            <button className="btn" onClick={useCurrentLocation}>
              <FaCrosshairs style={{ marginRight: 6 }} />
              Vị trí hiện tại
            </button>
          </div>

          {mapLoaded && (
            <MapContainer 
              center={userPos || [10.7769, 106.7009]} 
              zoom={14} 
              style={{ height: "100%", width: "100%" }}
              whenCreated={(map) => {
                // Force map to update its size after creation
                setTimeout(() => {
                  map.invalidateSize();
                }, 100);
              }}
            >
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FlyToLocation position={flyPos} />
              
              {userPos && (
                <Marker position={userPos} icon={userIcon}>
                  <Popup>Vị trí hiện tại của bạn</Popup>
                </Marker>
              )}
              
              {stations.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lon]} icon={chargerIcon} eventHandlers={{ click: () => setActiveId(s.id) }}>
                  <Popup>
                    <b>{s.name}</b><br />
                    <small>{s.district || "-"}</small><br />
                    {s.driveMin != null && <small>~ {s.driveMin} phút ({s.driveKm} km)</small>}<br />
                    <small>Slots còn lại: {s.remainingSlots ?? s.availableSlots ?? "-"} / {s.totalSlots ?? "-"}</small><br />
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn small" onClick={() => drawRoute(s)}>Tìm đường</button>
                      <button className="btn small" onClick={() => openGmaps(s)}>Google Maps</button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {route.length > 0 && <Polyline positions={route} color="blue" />}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}