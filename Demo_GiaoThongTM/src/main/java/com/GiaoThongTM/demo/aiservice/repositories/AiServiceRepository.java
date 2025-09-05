package com.GiaoThongTM.demo.aiservice.repositories;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import com.GiaoThongTM.demo.aiservice.dtos.StationData;
import com.GiaoThongTM.demo.aiservice.dtos.request.PredictPayload;
import com.GiaoThongTM.demo.aiservice.dtos.response.PredictItem;

/**
 * Repository chuyên gọi API Python.
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class AiServiceRepository {

    @Value("${ai.service.base-url:http://localhost:8000/api}")
    private String aiBaseUrl;

    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private final RestTemplate restTemplate = new RestTemplate();

    /* ----------------------- helpers ------------------------ */

    private HttpHeaders defaultHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set(HttpHeaders.ACCEPT_CHARSET, "utf-8");
        return headers;
    }

    private String toJson(Object body) {
        try {
            return mapper.writeValueAsString(body);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Serialize body to JSON failed", e);
        }
    }

    /* ----------------------- calls ------------------------ */

    /**
     * Gọi /suggest của AI (Python).
     * Sửa lỗi: KHÔNG dùng .parent() – xây payload bằng ObjectNode root.
     */
    public JsonNode callSuggest(List<StationData> stations,
                                double userLat, double userLon,
                                Double speedKmph,
                                Double maxDistanceKm,
                                Double slotOccupancyThreshold) {
        String url = aiBaseUrl + "/suggest";

        // root payload
        ObjectNode payload = mapper.createObjectNode();

        // user_location
        ObjectNode userLoc = payload.putObject("user_location");
        userLoc.put("lat", userLat);
        userLoc.put("lon", userLon);

        // stations_data (DTO đã @JsonNaming snake_case)
        payload.set("stations_data", mapper.valueToTree(stations));

        // optional params
        if (speedKmph != null) payload.put("speed_kmph", speedKmph);
        if (maxDistanceKm != null) payload.put("max_distance_km", maxDistanceKm);
        if (slotOccupancyThreshold != null) payload.put("slot_occupancy_threshold", slotOccupancyThreshold);

        String bodyJson = toJson(payload);
        HttpEntity<String> entity = new HttpEntity<>(bodyJson, defaultHeaders());

        try {
            Instant start = Instant.now();
            log.info(">>> POST  {} | headers={} \n>>> REQUEST JSON: {}", url, entity.getHeaders(), bodyJson);
            ResponseEntity<String> raw = restTemplate.postForEntity(url, entity, String.class);
            Duration rt = Duration.between(start, Instant.now());
            log.info("<<< STATUS {} ({} ms)", raw.getStatusCode().value(), rt.toMillis());
            log.info("<<< RESPONSE JSON: {}", raw.getBody());

            if (!raw.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Python API error status " + raw.getStatusCode().value());
            }
            if (raw.getBody() == null || raw.getBody().isBlank()) {
                throw new IllegalStateException("Python trả về body rỗng");
            }
            return mapper.readTree(raw.getBody());

        } catch (RestClientException ex) {
            log.error("Call /suggest failed: {}", ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Parse /suggest response failed: {}", ex.getMessage(), ex);
            throw new RuntimeException(ex);
        }
    }

    /**
     * Gọi /predict và trả về PredictItem bảo đảm có predictedDemand.
     * Chấp nhận 2 kiểu response:
     * 1) {"predicted_demand": 12.3}
     * 2) {"station_id":"X","predicted_demand":12.3}
     *    hoặc {"data":{"predicted_demand":...}}
     */
    public PredictItem callPredict(PredictPayload payload) {
        String url = aiBaseUrl + "/predict";

        String bodyJson = toJson(payload);
        HttpEntity<String> entity = new HttpEntity<>(bodyJson, defaultHeaders());

        try {
            Instant start = Instant.now();
            log.info(">>> POST  {} | headers={} \n>>> REQUEST JSON: {}", url, entity.getHeaders(), bodyJson);
            ResponseEntity<String> raw = restTemplate.postForEntity(url, entity, String.class);
            Duration rt = Duration.between(start, Instant.now());
            log.info("<<< STATUS {} ({} ms)", raw.getStatusCode().value(), rt.toMillis());
            log.info("<<< RESPONSE JSON: {}", raw.getBody());

            if (!raw.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Python API error status " + raw.getStatusCode().value());
            }
            if (raw.getBody() == null || raw.getBody().isBlank()) {
                throw new IllegalStateException("Python trả về body rỗng");
            }
            JsonNode tree = mapper.readTree(raw.getBody());

            PredictItem out = new PredictItem();
            // case 1: {"predicted_demand": number}
            if (tree.has("predicted_demand") && tree.get("predicted_demand").isNumber()) {
                out.setPredictedDemand(tree.get("predicted_demand").asDouble());
                if (tree.has("station_id")) out.setStationId(tree.get("station_id").asText());
                return out;
            }
            // case 2: {"data":{"predicted_demand":...}}
            if (tree.has("data") && tree.get("data").has("predicted_demand")) {
                JsonNode d = tree.get("data");
                if (d.has("station_id")) out.setStationId(d.get("station_id").asText());
                out.setPredictedDemand(d.get("predicted_demand").asDouble());
                return out;
            }
            // fallback: map toàn bộ
            return mapper.treeToValue(tree, PredictItem.class);

        } catch (RestClientException ex) {
            log.error("Call /predict failed: {}", ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Parse /predict response failed: {}", ex.getMessage(), ex);
            throw new RuntimeException(ex);
        }
    }
}
