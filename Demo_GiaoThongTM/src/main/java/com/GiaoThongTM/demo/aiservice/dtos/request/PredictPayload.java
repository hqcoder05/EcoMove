package com.GiaoThongTM.demo.aiservice.dtos.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;

/**
 * Payload gửi sang API Python /predict
 */
@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PredictPayload {
    private String location;
    private Integer hour;          // Python hiện chặn 0..23
    private String dayOfWeek;
    private String weather;
}
