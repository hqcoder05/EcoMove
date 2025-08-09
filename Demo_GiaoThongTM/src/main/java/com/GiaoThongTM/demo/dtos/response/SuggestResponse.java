package com.GiaoThongTM.demo.dtos.response;

import lombok.Data;

@Data
public class SuggestResponse {
    private String suggestedStation;
    private String reason;
}
