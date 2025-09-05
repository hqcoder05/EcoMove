package com.GiaoThongTM.demo.aiservice.dtos;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;


@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class StationData {
    private String stationId;
    private Double lat;
    private Double lon;
    private Integer totalSlots;
    private Integer availableSlots;
    private List<ChargingVehicle> chargingVehicles = new ArrayList<>();
}
