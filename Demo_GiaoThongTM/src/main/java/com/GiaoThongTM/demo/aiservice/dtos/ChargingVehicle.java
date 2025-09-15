package com.GiaoThongTM.demo.aiservice.dtos;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;

/**
 * DTO cho 1 xe đang sạc tại trạm – dùng để tính thời gian chờ.
 * Mapping theo snake_case để khớp API Python.
 */
@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ChargingVehicle {
    private Double batteryPercent;       // %
    private Double batteryCapacityKwh;   // kWh
    private Double chargeRateKw;         // kW
}
