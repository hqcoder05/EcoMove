package com.GiaoThongTM.demo.aiservice.dtos.response;

import java.util.Map;
import lombok.Data;

@Data
public class PredictDemandResponse {
    private Map<String, Object> predicted_demand;
    
}
