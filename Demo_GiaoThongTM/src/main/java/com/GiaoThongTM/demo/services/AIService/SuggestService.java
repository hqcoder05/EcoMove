package com.GiaoThongTM.demo.services.AIService;

import com.GiaoThongTM.demo.dtos.request.SuggestRequest;
import com.GiaoThongTM.demo.dtos.response.SuggestResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

public class SuggestService {
    @Value("${python.api.url}")
    private String pythonApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public SuggestResponse getSuggestion(SuggestRequest requestDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<SuggestRequest> request = new HttpEntity<>(requestDTO, headers);

        ResponseEntity<SuggestResponse> response = restTemplate.postForEntity(
                pythonApiUrl + "/suggest",
                request,
                SuggestResponse.class
        );

        return response.getBody();
    }
}
