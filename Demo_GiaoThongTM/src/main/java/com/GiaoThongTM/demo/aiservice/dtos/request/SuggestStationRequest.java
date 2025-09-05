package com.GiaoThongTM.demo.aiservice.dtos.request;
import com.GiaoThongTM.demo.aiservice.dtos.StationData;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SuggestStationRequest {
    @JsonProperty("user_location")
    private Map<String, Double> userLocation; // {"lat":..., "lon":...}

    @JsonProperty("stations_data")
    private List<StationData> stationsData;

    @JsonProperty("max_distance_km")
    private Double maxDistanceKm = 15.0;

    @JsonProperty("slot_occupancy_threshold")
    private Double slotOccupancyThreshold = 0.8;

    // meta tuỳ chọn
    @JsonProperty("payload_version")
    private String payloadVersion = "1.0";

    @JsonProperty("travel_time_source")
    private String travelTimeSource = "osrm";

    @JsonProperty("speed_kmph")
    private Double speedKmph;
}
