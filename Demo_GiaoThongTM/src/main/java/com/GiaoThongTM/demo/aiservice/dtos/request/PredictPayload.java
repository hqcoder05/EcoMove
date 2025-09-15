package com.GiaoThongTM.demo.aiservice.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/** Payload gửi sang Python */
@Data
public class PredictPayload {
    private String location;
    private Integer hour;

    @JsonProperty("day_of_week")
    private String dayOfWeek;

    // Python yêu cầu "sunny|rainy|cloudy" (chữ thường) -> đã chuẩn hoá ở AiService
    private String weather;
}
