package com.GiaoThongTM.demo.aiservice.dtos.request;

import lombok.Data;

@Data
public class PredictDemandRequest {
    private String location;
    private int hour;
    private String dayOfWeek;
    private String weather;
}



