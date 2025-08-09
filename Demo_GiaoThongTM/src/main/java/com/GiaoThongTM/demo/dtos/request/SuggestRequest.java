package com.GiaoThongTM.demo.dtos.request;

import lombok.Data;
import java.util.List;

@Data
public class SuggestRequest {

    private String currentStation;
    private List<StationData> stationsData;
    private double speedKmph;
    private int maxAcceptableTime;
    private double slotOccupancyThreshold;

    @Data
    public static class StationData {
        private String stationId;
        private int availableSlots;
        private int totalSlots;
        private double distanceKm;
        private List<String> chargingVehicles;
    }
}
