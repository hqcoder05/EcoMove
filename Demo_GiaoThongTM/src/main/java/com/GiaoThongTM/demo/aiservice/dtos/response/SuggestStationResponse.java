package com.GiaoThongTM.demo.aiservice.dtos.response;
import java.util.Map;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class SuggestStationResponse {

    @JsonProperty("tram_de_xuat")
    private String suggestedStation;

    @JsonProperty("ly_do")
    private String reason;

    @JsonProperty("thong_so")
    private Map<String, Object> metrics;

    // (tuỳ chọn) nếu Python có trả debug
    private Map<String, Object> debug;
}
