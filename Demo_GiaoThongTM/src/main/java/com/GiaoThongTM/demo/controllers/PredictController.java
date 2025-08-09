package com.GiaoThongTM.demo.controllers;

import com.GiaoThongTM.demo.dtos.request.PredictRequest;
import com.GiaoThongTM.demo.dtos.response.PredictResponse;
import com.GiaoThongTM.demo.services.AIService.PredictService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PredictController {
    @Autowired
    private PredictService predictService;

    @PostMapping("/predict")
    public PredictResponse predict(@RequestBody PredictRequest requestDTO) {
        return predictService.getPrediction(requestDTO);
    }
}
