package com.GiaoThongTM.demo.aiservice.dtos.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;

/**
 * 1 bản ghi dự báo (nếu API trả về nhiều mốc thời gian).
 * Với API /predict đơn lẻ, có thể không dùng class này.
 */
@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PredictItem {
    private String stationId;      // có thể null nếu API không trả về
    private Double predictedDemand;
    private Double hour;           // tuỳ trường hợp có/không
    private String location;       // tuỳ trường hợp có/không
}
