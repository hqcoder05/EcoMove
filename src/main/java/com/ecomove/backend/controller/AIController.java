package com.ecomove.backend.controller;

import com.ecomove.backend.model.Station;
import com.ecomove.backend.service.AIService;
import com.ecomove.backend.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Cho phép frontend gọi từ domain khác
public class AIController {

    @Autowired
    private StationService stationService;

    @Autowired
    private AIService aiService;

    /**
     * Gợi ý trạm thay thế gần người dùng (nếu trạm gần nhất bị đầy).
     *
     * @param lat vĩ độ của người dùng
     * @param lng kinh độ của người dùng
     * @return Thông tin trạm thay thế nếu có
     */
    @GetMapping("/suggest-alternative-station")
    public ResponseEntity<?> suggestStation(@RequestParam double lat, @RequestParam double lng) {
        List<Station> nearbyStations = stationService.getNearbyStations(lat, lng);

        if (nearbyStations == null || nearbyStations.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không có trạm nào gần vị trí hiện tại.");
        }

        Station suggested = aiService.suggestAlternativeStation(nearbyStations);

        if (suggested == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy trạm thay thế phù hợp.");
        }

        return ResponseEntity.ok(suggested);
    }
}
