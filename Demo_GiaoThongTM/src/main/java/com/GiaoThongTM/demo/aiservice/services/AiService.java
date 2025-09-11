package com.GiaoThongTM.demo.aiservice.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper; // NEW
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Service;

import java.net.URI; // NEW
import java.net.http.HttpClient; // NEW
import java.net.http.HttpRequest; // NEW
import java.net.http.HttpResponse; // NEW
import java.time.Duration; // NEW
import java.util.ArrayList;
import java.util.List;

import com.GiaoThongTM.demo.aiservice.dtos.StationData;
import com.GiaoThongTM.demo.aiservice.dtos.request.PredictPayload;
import com.GiaoThongTM.demo.aiservice.dtos.response.PredictItem;
import com.GiaoThongTM.demo.aiservice.repositories.AiServiceRepository;
import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.stations.repositories.StationRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final AiServiceRepository aiRepo;
    private final StationRepository stationRepo; // <-- đọc DB

    // ============ OSRM Config ============
    // Có thể override bằng ENV: OSRM_BASE_URL (VD: http://localhost:5000)
    private static final String OSRM_BASE_URL =
            System.getenv().getOrDefault("OSRM_BASE_URL", "https://router.project-osrm.org");
    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** Dùng danh sách trạm client truyền lên (để test nhanh) */
    public JsonNode suggestForUser(double userLat, double userLon, List<StationData> stations) {
        // mặc định: speed=30km/h, không giới hạn khoảng cách (null), threshold=0.8
        log.info("[AI] Using {} stations from request body", (stations == null ? 0 : stations.size()));
        return aiRepo.callSuggest(stations, userLat, userLon, 30.0, null, 0.8);
    }

    /**
     * Dùng DS trạm từ DB.
     * Giữ API cũ: nếu maxDistanceKm != null => lọc bằng **route distance từ OSRM** (không còn haversine).
     * speedKmph vẫn giữ để tương thích AI-service (không còn dùng để tính thời gian ở đây).
     */
    public JsonNode suggestForUserFromDb(double userLat, double userLon,
                                         Double maxDistanceKm, Double speedKmph, Double slotOccupancyThreshold) {
        Double speed = (speedKmph != null) ? speedKmph : 30.0;
        Double threshold = (slotOccupancyThreshold != null) ? slotOccupancyThreshold : 0.8;

        List<Station> entities = stationRepo.findAll();
        log.info("[AI] Stations in DB: {}", entities.size());

        List<StationData> dtos = new ArrayList<>(entities.size());

        for (Station s : entities) {
            StationData dto = mapStationToStationDataFlexible(s);

            if (dto.getLat() == null || dto.getLon() == null) {
                log.warn("[AI] Skip station missing lat/lon: {}", s);
                continue;
            }

            // Nếu có bán kính => dùng OSRM distance (km)
            if (maxDistanceKm != null) {
                RouteStat stat = osrmRoute(userLat, userLon, dto.getLat(), dto.getLon());
                if (!stat.ok) {
                    log.warn("[AI] OSRM failed for station {}: {}", dto.getStationId(), stat.errMsg);
                    continue; // an toàn: bỏ trạm khi không route được
                }
                if (stat.distanceKm > maxDistanceKm) continue;
            }
            dtos.add(dto);
        }

        log.info("[AI] Stations sent to Python: {}", dtos.size());
        // Truyền maxDistanceKm xuống Python như cũ (AI vẫn có thể dùng), nhưng Java đã lọc theo route distance rồi
        return aiRepo.callSuggest(dtos, userLat, userLon, speed, maxDistanceKm, threshold);
    }

    /**
     * Overload: lọc theo **thời gian di chuyển** từ OSRM (phút).
     * Nếu maxTravelTimeMin = null => không giới hạn.
     */
    public JsonNode suggestForUserFromDbByTime(double userLat, double userLon,
                                               Double maxTravelTimeMin, Double speedKmph, Double slotOccupancyThreshold) {
        Double speed = (speedKmph != null) ? speedKmph : 30.0;
        Double threshold = (slotOccupancyThreshold != null) ? slotOccupancyThreshold : 0.8;

        List<Station> entities = stationRepo.findAll();
        log.info("[AI] Stations in DB: {}", entities.size());

        List<StationData> dtos = new ArrayList<>(entities.size());

        for (Station s : entities) {
            StationData dto = mapStationToStationDataFlexible(s);

            if (dto.getLat() == null || dto.getLon() == null) {
                log.warn("[AI] Skip station missing lat/lon: {}", s);
                continue;
            }

            if (maxTravelTimeMin != null) {
                RouteStat stat = osrmRoute(userLat, userLon, dto.getLat(), dto.getLon());
                if (!stat.ok) {
                    log.warn("[AI] OSRM failed for station {}: {}", dto.getStationId(), stat.errMsg);
                    continue;
                }
                if (stat.durationMin > maxTravelTimeMin) continue;
            }
            dtos.add(dto);
        }

        log.info("[AI] Stations sent to Python (time-filter): {}", dtos.size());
        // Không giới hạn distance phía Python nữa
        return aiRepo.callSuggest(dtos, userLat, userLon, speed, null, threshold);
    }

    public PredictItem predictDemand(String location, int hour, String dOW, String weather) {
        PredictPayload req = new PredictPayload();
        req.setLocation(location);
        req.setHour(hour);
        req.setDayOfWeek(dOW);
        req.setWeather(weather);
        return aiRepo.callPredict(req);
    }

    /* ================= Mapping helpers ================= */

    private StationData mapStationToStationDataFlexible(Station s) {
        BeanWrapper bw = new BeanWrapperImpl(s);
        StationData dto = new StationData();

        Object id = firstNonNull(bw, "stationId", "id", "code");
        if (id != null) dto.setStationId(String.valueOf(id));

        Double lat = asDouble(firstNonNull(bw,
                "lat", "latitude", "y", "geoLat", "latDeg", "latitudeDeg"));
        Double lon = asDouble(firstNonNull(bw,
                "lon", "lng", "longitude", "long", "longtitude", "x", "geoLon", "lonDeg", "longitudeDeg"));
        dto.setLat(lat);
        dto.setLon(lon);

        Integer total = asInt(firstNonNull(bw, "totalSlots", "capacity", "numSlots", "totalSlot"));
        Integer avail = asInt(firstNonNull(bw, "availableSlots", "available", "freeSlots", "free"));
        dto.setTotalSlots(total != null ? total : 0);
        dto.setAvailableSlots(avail != null ? avail : 0);

        return dto;
    }

    private Object firstNonNull(BeanWrapper bw, String... props) {
        for (String p : props) {
            if (bw.isReadableProperty(p)) {
                Object v = bw.getPropertyValue(p);
                if (v != null) return v;
            }
        }
        return null;
    }

    private Double asDouble(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(String.valueOf(v)); } catch (Exception e) { return null; }
    }

    private Integer asInt(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.intValue();
        try { return Integer.parseInt(String.valueOf(v)); } catch (Exception e) { return null; }
    }

    // ======= BỎ: haversineKm() – không còn dùng nữa =======

    /* ================= OSRM helpers ================= */

    private record RouteStat(boolean ok, double distanceKm, double durationMin, String errMsg) {}

    /**
     * Gọi OSRM để lấy độ dài tuyến (km) và thời gian (phút).
     * Return ok=false nếu lỗi hoặc không có route.
     */
    private RouteStat osrmRoute(double lat1, double lon1, double lat2, double lon2) {
        try {
            // OSRM yêu cầu thứ tự: lon,lat
            String path = String.format("%s/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=false&alternatives=false&steps=false",
                    OSRM_BASE_URL, lon1, lat1, lon2, lat2);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(path))
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .header("User-Agent", "EcoMove-AIService/1.0")
                    .build();

            HttpResponse<String> resp = HTTP.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                return new RouteStat(false, 0, 0, "HTTP " + resp.statusCode());
            }
            JsonNode root = MAPPER.readTree(resp.body());
            if (!"Ok".equalsIgnoreCase(root.path("code").asText())) {
                return new RouteStat(false, 0, 0, "OSRM code: " + root.path("code").asText());
            }
            JsonNode routes = root.path("routes");
            if (!routes.isArray() || routes.isEmpty()) {
                return new RouteStat(false, 0, 0, "No routes");
            }
            JsonNode r0 = routes.get(0);
            double distanceM = r0.path("distance").asDouble(0.0);
            double durationS = r0.path("duration").asDouble(0.0);

            double km = distanceM / 1000.0;
            double min = durationS / 60.0;
            return new RouteStat(true, km, min, null);
        } catch (Exception e) {
            return new RouteStat(false, 0, 0, e.getMessage());
        }
    }
}
