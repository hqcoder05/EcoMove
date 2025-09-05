package com.GiaoThongTM.demo.aiservice.Controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import com.GiaoThongTM.demo.aiservice.services.AiService;
import com.GiaoThongTM.demo.aiservice.dtos.StationData;
import com.GiaoThongTM.demo.aiservice.dtos.response.PredictItem;

/**
 * REST Controller cho các endpoint Java -> Python AI.
 */
@RestController
@RequestMapping("/ai") // app có context-path /api => URL thực tế: /api/ai/...
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    /* ---------- Suggest ----------- */

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

    /* ---------- Predict ----------- */

    @Data
    public static class PredictBody {
        private String location;
        private int hour;
        private String dayOfWeek;
        private String weather;
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictItem> predict(@RequestBody PredictBody body) {
        PredictItem out = aiService.predictDemand(
                body.getLocation(),
                body.getHour(),
                body.getDayOfWeek(),
                body.getWeather()
        );
        return ResponseEntity.ok(out);
    }
}
