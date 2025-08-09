package com.GiaoThongTM.demo.services.AIService;

import com.GiaoThongTM.demo.dtos.request.PredictRequest;
import com.GiaoThongTM.demo.dtos.response.PredictResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PredictService {

    @Value("${python.api.url}")
    private String pythonApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public PredictResponse getPrediction(PredictRequest requestDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PredictRequest> httpEntity = new HttpEntity<>(requestDTO, headers);

        ResponseEntity<PredictResponse> response = restTemplate.postForEntity(
                pythonApiUrl + "/predict",
                httpEntity,
                PredictResponse.class
        );

        return response.getBody();
    }

}
