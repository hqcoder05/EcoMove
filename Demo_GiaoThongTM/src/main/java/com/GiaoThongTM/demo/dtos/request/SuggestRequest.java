package com.GiaoThongTM.demo.dtos.request;

import lombok.Data;
import java.util.List;

@Data
public class SuggestRequest {
    private List<StationData> stationsData; // Dữ liệu tất cả trạm
    private double speedKmph;               // Tốc độ xe (km/h)
    private int maxAcceptableTime;           // Thời gian tối đa người dùng chấp nhận (phút)
    private double slotOccupancyThreshold;   // Ngưỡng % slot đã đầy để coi là "gần hết chỗ"

    @Data
    public static class StationData {
        private String stationId;
        private double distanceKm;        // Khoảng cách từ người dùng/trạm hiện tại
        private int availableSlots;
        private int totalSlots;
        private List<Double> chargingDurations; // Danh sách thời gian sạc còn lại (phút) cho từng xe đang sạc
    }
}
