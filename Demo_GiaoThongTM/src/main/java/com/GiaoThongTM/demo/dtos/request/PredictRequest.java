package com.GiaoThongTM.demo.dtos.request;

import lombok.Data;

@Data
public class PredictRequest {
    private String location;
    private Double hour;
    private String dayOfWeek;
    private String weather;
}
