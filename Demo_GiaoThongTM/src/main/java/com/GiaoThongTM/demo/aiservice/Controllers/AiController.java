package com.GiaoThongTM.demo.aiservice.Controllers;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import com.GiaoThongTM.demo.aiservice.services.AiService;
import com.GiaoThongTM.demo.aiservice.dtos.StationData;
import com.GiaoThongTM.demo.aiservice.dtos.response.PredictItem;

// ✅ thêm import cho entity & repository
import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.stations.repositories.StationRepository;

/**
 * REST Controller cho các endpoint Java -> Python AI.
 */
@RestController
@RequestMapping("/ai")
@CrossOrigin(
    origins = { "http://localhost:3000", "http://localhost:5173", "http://localhost:5174" },
    allowedHeaders = "*",
    methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS },
    allowCredentials = "true",
    maxAge = 3600
)
@RequiredArgsConstructor
public class SuggestController {

    private final AiService aiService;
    private final StationRepository stationRepo; // ✅ dùng để trả danh sách trạm & bulk predict
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /* ---------- DTO xuất danh sách trạm cho FE ---------- */
    @Data
    public static class StationSummary {
        private String stationId;
        private String name;
        private String district;
        private Double lat;
        private Double lon;
        private Integer totalSlots;
        private Integer availableSlots;
    }

    /* ======================================================
     *                   STATIONS (ARRAY)
     * ====================================================== */
    @GetMapping("/stations")
    public ResponseEntity<List<StationSummary>> listStations() {
        List<StationSummary> out = new ArrayList<>();
        for (Station s : stationRepo.findAll()) {
            StationSummary dto = mapStationToSummary(s);
            // chỉ trả các trạm có tọa độ hợp lệ
            if (dto.getLat() != null && dto.getLon() != null) {
                out.add(dto);
            }
        }
        return ResponseEntity.ok(out); // FE sẽ nhận một mảng []
    }

    /* ======================================================
     *                       SUGGEST
     * ====================================================== */
    @Data
    public static class Location {
        private Double lat;
        private Double lon;
    }

    @Data
    public static class SuggestBody {
        // Kiểu mới:
        @JsonProperty("user_location")
        private Location userLocation;

        // Kiểu cũ:
        private Double userLat;
        private Double userLon;

        // Tuỳ chọn: nếu không truyền thì Controller sẽ tự lấy DB
        private List<StationData> stations;

        // Tuỳ chọn: cấu hình thuật toán (có thể bỏ qua)
        private Double maxDistanceKm;          // nếu null => không lọc, gửi TẤT CẢ
        private Double speedKmph;              // mặc định 30
        private Double slotOccupancyThreshold; // mặc định 0.8
    }

    @PostMapping("/suggest")
    public ResponseEntity<JsonNode> suggest(@RequestBody SuggestBody body) {
        // Lấy lat/lon từ user_location hoặc userLat/userLon
        double lat = (body.getUserLocation() != null && body.getUserLocation().getLat() != null)
                ? body.getUserLocation().getLat()
                : (body.getUserLat() != null ? body.getUserLat() : 0.0);
        double lon = (body.getUserLocation() != null && body.getUserLocation().getLon() != null)
                ? body.getUserLocation().getLon()
                : (body.getUserLon() != null ? body.getUserLon() : 0.0);

        // Nếu không truyền danh sách trạm -> tự lấy từ DB (lọc theo bán kính nếu có maxDistanceKm)
        if (body.getStations() == null || body.getStations().isEmpty()) {
            JsonNode res = aiService.suggestForUserFromDb(
                    lat,
                    lon,
                    body.getMaxDistanceKm(),
                    body.getSpeedKmph(),
                    body.getSlotOccupancyThreshold()
            );
            return ResponseEntity.ok(res);
        }

        // Nếu có danh sách trạm trong body -> dùng ngay (để test nhanh)
        JsonNode res = aiService.suggestForUser(
                lat,
                lon,
                body.getStations()
        );
        return ResponseEntity.ok(res);
    }

    /* ======================================================
     *                       PREDICT
     * ====================================================== */
    @Data
    public static class PredictBody {
        private String location;   // station UUID/code hoặc district

        // Để Integer để có thể null -> Service sẽ tự lấy giờ hiện tại nếu null
        private Integer hour;

        // Cho phép nhận cả "dayOfWeek" lẫn "day_of_week"
        @JsonProperty("dayOfWeek")
        @JsonAlias({ "day_of_week" })
        private String dayOfWeek;

        private String weather;    // có thể bỏ -> BE suy luận từ OpenWeather
    }

    /** Trả về DTO đầy đủ (giữ endpoint cũ để tương thích) */
    @PostMapping("/predict")
    public ResponseEntity<PredictItem> predict(@RequestBody PredictBody body) {
        PredictItem out = aiService.predictDemand(
                body.getLocation(),
                body.getHour(),        // có thể null -> service auto-fill
                body.getDayOfWeek(),   // có thể null -> service auto-fill
                body.getWeather()
        );
        return ResponseEntity.ok(out);
    }

    /** ✅ Endpoint tối giản: chỉ trả { "predicted_demand": <number> } (đã làm tròn ở service) */
    @PostMapping("/predict-min")
    public ResponseEntity<JsonNode> predictMinimal(@RequestBody PredictBody body) {
        JsonNode out = aiService.predictDemandMinimal(
                body.getLocation(),
                body.getHour(),
                body.getDayOfWeek(),
                body.getWeather()
        );
        return ResponseEntity.ok(out);
    }

    /* ======================================================
     *              BULK PREDICT: NEXT HOUR (ALL)
     * ====================================================== */
    /**
     * Dự báo cho tất cả trạm trong DB cho giờ kế tiếp (tính theo server time).
     * Trả array: [{stationId, name, district, predicted_demand}]
     */
    @GetMapping("/predict/next-hour/all")
    public ResponseEntity<List<ObjectNode>> predictAllNextHour() {
        LocalDateTime next = LocalDateTime.now().plusHours(1);
        int hour = next.getHour();
        String dayOfWeek = next.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        List<ObjectNode> out = new ArrayList<>();
        for (Station s : stationRepo.findAll()) {
            BeanWrapper bw = new BeanWrapperImpl(s);
            Object idObj = firstNonNull(bw, "stationId", "id", "code");
            if (idObj == null) continue;
            String loc = String.valueOf(idObj);

            JsonNode pd = aiService.predictDemandMinimal(loc, hour, dayOfWeek, null);

            ObjectNode row = MAPPER.createObjectNode();
            row.put("stationId", loc);
            row.put("name", asStr(firstNonNull(bw, "name", "stationName", "title", "code")));
            row.put("district", asStr(firstNonNull(bw, "district", "districtName", "quan", "quanHuyen", "area")));
            row.set("predicted_demand", pd.get("predicted_demand"));
            out.add(row);
        }
        return ResponseEntity.ok(out);
    }

    /* ======================================================
     *                       Helpers
     * ====================================================== */
    private StationSummary mapStationToSummary(Station s) {
        BeanWrapper bw = new BeanWrapperImpl(s);
        StationSummary dto = new StationSummary();

        dto.setStationId(asStr(firstNonNull(bw, "stationId", "id", "code")));
        dto.setName(asStr(firstNonNull(bw, "name", "stationName", "title", "code")));
        dto.setDistrict(asStr(firstNonNull(bw, "district", "districtName", "quan", "quanHuyen", "area")));

        dto.setLat(asDouble(firstNonNull(bw, "lat", "latitude", "y", "geoLat", "latDeg", "latitudeDeg")));
        dto.setLon(asDouble(firstNonNull(bw, "lon", "lng", "longitude", "long", "longtitude", "x", "geoLon", "lonDeg", "longitudeDeg")));

        dto.setTotalSlots(asInt(firstNonNull(bw, "totalSlots", "capacity", "numSlots", "totalSlot")));
        dto.setAvailableSlots(asInt(firstNonNull(bw, "availableSlots", "available", "freeSlots", "free")));

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

    private String asStr(Object v) { return (v == null) ? null : String.valueOf(v); }

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
}
