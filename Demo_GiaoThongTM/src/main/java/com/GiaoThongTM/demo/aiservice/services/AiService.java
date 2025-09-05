package com.GiaoThongTM.demo.aiservice.services;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Service;

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

    /** Dùng danh sách trạm client truyền lên (để test nhanh) */
    public JsonNode suggestForUser(double userLat, double userLon, List<StationData> stations) {
        // mặc định: speed=30km/h, không giới hạn khoảng cách (null), threshold=0.8
        log.info("[AI] Using {} stations from request body", (stations == null ? 0 : stations.size()));
        return aiRepo.callSuggest(stations, userLat, userLon, 30.0, null, 0.8);
    }

    /** Dùng DS trạm từ DB. Nếu maxDistanceKm = null => gửi TẤT CẢ trạm. */
    public JsonNode suggestForUserFromDb(double userLat, double userLon,
                                         Double maxDistanceKm, Double speedKmph, Double slotOccupancyThreshold) {
        Double speed = (speedKmph != null) ? speedKmph : 30.0;
        Double threshold = (slotOccupancyThreshold != null) ? slotOccupancyThreshold : 0.8;

        List<Station> entities = stationRepo.findAll(); // lấy TOÀN BỘ trạm
        log.info("[AI] Stations in DB: {}", entities.size());

        List<StationData> dtos = new ArrayList<>(entities.size());

        for (Station s : entities) {
            StationData dto = mapStationToStationDataFlexible(s);

            if (dto.getLat() == null || dto.getLon() == null) {
                log.warn("[AI] Skip station missing lat/lon: {}", s);
                continue; // an toàn: Python cần toạ độ
            }

            // Nếu có bán kính => lọc; nếu không => gửi tất cả
            if (maxDistanceKm != null) {
                double d = haversineKm(userLat, userLon, dto.getLat(), dto.getLon());
                if (d > maxDistanceKm) continue;
            }
            dtos.add(dto);
        }

        log.info("[AI] Stations sent to Python: {}", dtos.size());
        // Truyền maxDistanceKm xuống Python (nếu null => không giới hạn)
        return aiRepo.callSuggest(dtos, userLat, userLon, speed, maxDistanceKm, threshold);
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

        // alias rộng cho toạ độ
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

        // Nếu có quan hệ Station -> ChargingVehicle, map thêm tại đây
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

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2)*Math.sin(dLat/2)
                + Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon/2)*Math.sin(dLon/2);
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
