package com.GiaoThongTM.demo.aiservice.dtos.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Iterator;
import java.util.Map;

/**
 * Chỉ expose "predicted_demand" (rounded 2 decimals) khi serialize.
 * Các field khác được @JsonIgnore để không xuất ra JSON.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PredictItem {

    // --- metadata giữ cho nội bộ dùng, KHÔNG serialize ra JSON ---
    @JsonIgnore private String stationId;
    @JsonIgnore private String location;
    @JsonIgnore private Integer hour;
    @JsonIgnore private String dayOfWeek;
    @JsonIgnore private String weather;

    // Giá trị số đã chuẩn hoá để BE/FE dùng (giữ nội bộ)
    @JsonIgnore
    private Double predictedDemand;

    // Raw để debug (không serialize)
    @JsonIgnore
    private JsonNode predictedDemandRaw;

    // ---------- predicted_demand (nhận vào linh hoạt) ----------
    @JsonProperty("predicted_demand")
    public void setPredictedDemandFlexible(JsonNode node) {
        this.predictedDemandRaw = node;

        if (node == null || node.isNull()) {
            this.predictedDemand = null;
            return;
        }
        if (node.isNumber()) {
            this.predictedDemand = node.asDouble();
            return;
        }
        if (node.isObject()) {
            this.predictedDemand = extractNumberFromObject(node);
            return;
        }
        // string có thể parse
        try {
            this.predictedDemand = Double.valueOf(node.asText());
        } catch (Exception ignore) {
            this.predictedDemand = null;
        }
    }

    // ---------- predicted_demand (xuất ra: chỉ số, làm tròn 2 chữ số) ----------
    @JsonProperty("predicted_demand")
    public Double getPredictedDemandOut() {
        if (this.predictedDemand == null) return null;
        BigDecimal rounded = BigDecimal.valueOf(this.predictedDemand)
                                        .setScale(2, RoundingMode.HALF_UP);
        return rounded.doubleValue(); // JSON number (không giữ 0 đuôi)
        // Nếu muốn luôn 2 chữ số (ví dụ 5.50) thì thay trả về String:
        // return Double.parseDouble(String.format(java.util.Locale.US, "%.2f", rounded.doubleValue()));
    }

    // Helper: lấy số từ object theo các key phổ biến, nếu không có thì lấy số đầu tiên
    private Double extractNumberFromObject(JsonNode obj) {
        String[] preferred = {"value", "mean", "avg", "yhat", "point", "prediction", "pred", "estimate", "score"};
        for (String k : preferred) {
            if (obj.has(k) && obj.get(k).isNumber()) {
                return obj.get(k).asDouble();
            }
        }
        Iterator<Map.Entry<String, JsonNode>> it = obj.fields();
        while (it.hasNext()) {
            Map.Entry<String, JsonNode> e = it.next();
            if (e.getValue().isNumber()) {
                return e.getValue().asDouble();
            }
        }
        return null;
    }
}
