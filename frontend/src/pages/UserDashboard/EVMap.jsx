// src/pages/UserDashboard/EVMap.jsx
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "http://localhost:8080/api";

// Icons
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
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Backend calls ---
async function fetchStations() {
    const res = await fetch(`${API_BASE}/stations`, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const rows = await res.json();
    return (rows ?? []).map((r, idx) => ({
        id: r.stationId ?? r.station_id ?? idx + 1,
        name: r.stationName ?? r.station_name ?? `Station ${idx + 1}`,
        district: r.district ?? "",
        lat: Number(r.lat ?? r.latitude),
        lon: Number(r.lon ?? r.longitude),
        totalSlots: r.totalSlots ?? r.total_slots ?? null,
        availableSlots: r.availableSlots ?? r.available_slots ?? null,
    })).filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lon));
}

async function fetchAiSuggestion(userPos) {
    // Gửi theo schema controller: user_location.lat/lon; để stations trống → backend tự lấy DB
    const body = {
        user_location: { lat: userPos[0], lon: userPos[1] },
        // maxDistanceKm, speedKmph, slotOccupancyThreshold: có thể truyền thêm nếu cần
    };
    const res = await fetch(`${API_BASE}/ai/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return res.json(); // JsonNode tùy cấu trúc
}

// Cố gắng map JsonNode trả về thành 1 trạm {id,name,lat,lon,...}
function pickSuggestedStation(aiJson, stations) {
    if (!aiJson) return null;

    // Một số khả năng tên field thường thấy:
    // 1) { best: { station_id, station_name, lat, lon, score } }
    // 2) { best_station: {...} }
    // 3) { suggestion: {...} }
    // 4) { results: [{...}, ...] } hoặc { ranked: [ {...} ] }
    const candidates = [];

    const tryPush = (node) => {
        if (!node) return;
        const id = node.stationId ?? node.station_id ?? node.id ?? null;
        const name = node.stationName ?? node.station_name ?? node.name ?? null;
        const lat = Number(node.lat ?? node.latitude);
        const lon = Number(node.lon ?? node.longitude);
        const score = node.score ?? node.rankScore ?? node.potential ?? null;
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            candidates.push({ id, name, lat, lon, score, raw: node });
        }
    };

    tryPush(aiJson.best);
    tryPush(aiJson.best_station);
    tryPush(aiJson.suggestion);

    if (Array.isArray(aiJson.results)) tryPush(aiJson.results[0]);
    if (Array.isArray(aiJson.ranked)) tryPush(aiJson.ranked[0]);
    if (Array.isArray(aiJson.top)) tryPush(aiJson.top[0]);

    // Nếu chưa có, duyệt các property con để kiếm node có lat/lon
    if (!candidates.length) {
        for (const k of Object.keys(aiJson)) {
            const n = aiJson[k];
            if (n && typeof n === "object" && !Array.isArray(n)) {
                tryPush(n);
            }
        }
    }

    // Ưu tiên trùng với trạm trong danh sách để lấy thêm district/slots
    const matchByPos = (cand) => stations.find(s => Math.abs(s.lat - cand.lat) < 1e-6 && Math.abs(s.lon - cand.lon) < 1e-6);
    const matchById  = (cand) => cand.id ? stations.find(s => `${s.id}` === `${cand.id}`) : null;
    for (const c of candidates) {
        let s = matchById(c) || matchByPos(c);
        if (s) {
            return { ...s, score: c.score ?? null, _fromAi: true };
        }
    }

    // Nếu không match, chọn candidate đầu và tạo object tối thiểu
    if (candidates.length) {
        const c = candidates[0];
        return {
            id: c.id ?? "ai-suggest",
            name: c.name ?? "AI Suggested Station",
            district: "",
            lat: c.lat,
            lon: c.lon,
            totalSlots: null,
            availableSlots: null,
            score: c.score ?? null,
            _fromAi: true,
        };
    }

    return null;
}

export default function EVMap() {
    const [userPos, setUserPos] = useState(null);
    const [stations, setStations] = useState([]);
    const [route, setRoute] = useState([]);
    const [search, setSearch] = useState("");
    const [flyPos, setFlyPos] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [error, setError] = useState("");
    const [aiJson, setAiJson] = useState(null);
    const [aiStation, setAiStation] = useState(null);
    const [aiError, setAiError] = useState("");

    // Load vị trí & danh sách trạm
    useEffect(() => {
        const load = async (lat, lon) => {
            try {
                const data = await fetchStations();
                setStations(data);
                if (!activeId && data.length) setActiveId(data[0].id);
            } catch (e) {
                setError(`Fetch /stations failed: ${e.message}`);
                console.error("Fetch /stations failed:", e);
            }
        };

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const { latitude, longitude } = coords;
                setUserPos([latitude, longitude]);
                await load(latitude, longitude);
            },
            async () => {
                const lat = 10.7769, lon = 106.7009; // HCM default
                setUserPos([lat, lon]);
                await load(lat, lon);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []); // once

    // Khi có userPos & stations, gọi AI suggest
    useEffect(() => {
        const run = async () => {
            if (!userPos) return;
            try {
                const json = await fetchAiSuggestion(userPos);
                setAiJson(json);
                const picked = pickSuggestedStation(json, stations);
                setAiStation(picked);
            } catch (e) {
                setAiError(`AI suggest failed: ${e.message}`);
                console.error("AI suggest failed:", e);
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userPos, JSON.stringify(stations.map(s => s.id))]); // gọi lại khi danh sách trạm đổi

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
        const kw = search.trim().toLowerCase();
        if (!kw) return stations;
        return stations.filter(s =>
            s.name.toLowerCase().includes(kw) || (s.district || "").toLowerCase().includes(kw)
        );
    }, [search, stations]);

    const panTo = (s) => {
        setActiveId(s.id);
        setFlyPos([s.lat, s.lon]);
    };

    const drawRoute = async (s) => {
        if (!userPos || !s) return;
        const url = `https://router.project-osrm.org/route/v1/driving/${userPos[1]},${userPos[0]};${s.lon},${s.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.length) {
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            setRoute(coords);
            setFlyPos([s.lat, s.lon]);
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "100vh" }}>
            {/* Sidebar */}
            <aside style={{ borderRight: "1px solid #eee", padding: 12, overflow: "auto" }}>
                <h3 style={{ margin: "6px 0 12px" }}>Trạm sạc</h3>

                {/* AI Suggestion card */}
                <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Trạm tiềm năng nhất (AI)</div>
                    {aiError && (
                        <div style={{ background: "#ffefef", color: "#a00", padding: 8, borderRadius: 6, marginBottom: 10 }}>
                            {aiError}
                        </div>
                    )}
                    {aiStation ? (
                        <div
                            onClick={() => panTo(aiStation)}
                            style={{
                                border: "2px solid #16a34a",
                                background: "#f0fff4",
                                borderRadius: 10,
                                padding: 10,
                                cursor: "pointer",
                                marginBottom: 10,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <strong>{aiStation.name}</strong>
                                {typeof aiStation.score !== "undefined" && aiStation.score !== null && (
                                    <span style={{ fontSize: 12, background: "#dcfce7", color: "#065f46", padding: "2px 6px", borderRadius: 6 }}>
                    Score: {Math.round(aiStation.score * 100) / 100}
                  </span>
                                )}
                            </div>
                            <div style={{ fontSize: 13, color: "#555" }}>{aiStation.district || "-"}</div>
                            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                                Slots: {aiStation.availableSlots ?? "-"} / {aiStation.totalSlots ?? "-"}
                            </div>
                            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                                <button onClick={(e) => { e.stopPropagation(); panTo(aiStation); }}>Xem trên bản đồ</button>
                                <button onClick={(e) => { e.stopPropagation(); drawRoute(aiStation); }}>Tìm đường</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ fontSize: 13, color: "#666" }}>Đang tính gợi ý…</div>
                    )}
                </div>

                {/* Tìm kiếm */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input
                        style={{ flex: 1, padding: 8 }}
                        placeholder="Tìm theo tên/quận"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button onClick={() => setSearch("")}>Xoá</button>
                </div>

                {/* Lỗi stations */}
                {error && (
                    <div style={{ background: "#ffefef", color: "#a00", padding: 8, borderRadius: 6, marginBottom: 10 }}>
                        {error}
                    </div>
                )}

                {/* Danh sách trạm */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filtered.map((s) => {
                        const isNearest = nearest?.station?.id === s.id;
                        const isActive = activeId === s.id;
                        const isAi = aiStation && s.id === aiStation.id;
                        return (
                            <div
                                key={s.id}
                                onClick={() => panTo(s)}
                                style={{
                                    border: isActive ? "2px solid #2563eb" : "1px solid #e5e7eb",
                                    borderRadius: 10,
                                    padding: 10,
                                    cursor: "pointer",
                                    background: isActive ? "#f0f6ff" : "#fff",
                                }}
                            >
                                <div style={{ display: "flex", gap: 6, alignItems: "baseline", justifyContent: "space-between" }}>
                                    <strong>{s.name}</strong>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {isAi && (
                                            <span style={{ fontSize: 12, background: "#dcfce7", color: "#065f46", padding: "2px 6px", borderRadius: 6 }}>
                        Gợi ý AI
                      </span>
                                        )}
                                        {isNearest && (
                                            <span style={{ fontSize: 12, background: "#e6ffed", color: "#0b8a3a", padding: "2px 6px", borderRadius: 6 }}>
                        Gần nhất
                      </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ fontSize: 13, color: "#555" }}>{s.district || "-"}</div>
                                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                                    Slots: {s.availableSlots ?? "-"} / {s.totalSlots ?? "-"}
                                </div>
                                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                                    <button onClick={(e) => { e.stopPropagation(); panTo(s); }}>Xem trên bản đồ</button>
                                    <button onClick={(e) => { e.stopPropagation(); drawRoute(s); }}>Tìm đường</button>
                                </div>
                            </div>
                        );
                    })}
                    {!filtered.length && <div>Không có trạm nào khớp tìm kiếm.</div>}
                </div>
            </aside>

            {/* Map */}
            <div style={{ position: "relative" }}>
                <MapContainer center={userPos || [10.7769, 106.7009]} zoom={14} style={{ height: "100%", width: "100%" }}>
                    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <FlyToLocation position={flyPos} />

                    {userPos && (
                        <Marker position={userPos} icon={userIcon}>
                            <Popup>Bạn đang ở đây</Popup>
                        </Marker>
                    )}

                    {stations.map((s) => (
                        <Marker
                            key={s.id}
                            position={[s.lat, s.lon]}
                            icon={chargerIcon}
                            eventHandlers={{ click: () => setActiveId(s.id) }}
                        >
                            <Popup>
                                <b>{s.name}</b><br />
                                <small>{s.district || "-"}</small><br />
                                <small>Slots: {s.availableSlots ?? "-"} / {s.totalSlots ?? "-"}</small><br />
                                <button onClick={() => drawRoute(s)} style={{ marginTop: 6 }}>Tìm đường</button>
                            </Popup>
                        </Marker>
                    ))}

                    {route.length > 0 && <Polyline positions={route} color="blue" />}
                </MapContainer>
            </div>
        </div>
    );
}
