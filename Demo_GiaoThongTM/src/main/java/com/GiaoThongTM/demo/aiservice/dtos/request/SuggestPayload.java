package com.GiaoThongTM.demo.aiservice.dtos.request;

import java.util.List;
import lombok.Data;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.GiaoThongTM.demo.aiservice.dtos.StationData;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SuggestPayload {
    private UserLocation userLocation;          // -> user_location
    private Double speedKmph;                   // -> speed_kmph
    private Double maxDistanceKm;               // -> max_distance_km
    private Double slotOccupancyThreshold;      // -> slot_occupancy_threshold
    private List<StationData> stationsData;     // -> stations_data

    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class UserLocation {
        private double lat;
        private double lon;
    }
}
