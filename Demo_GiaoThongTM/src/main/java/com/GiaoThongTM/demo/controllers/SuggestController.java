package com.GiaoThongTM.demo.controllers;

import com.GiaoThongTM.demo.dtos.request.SuggestRequest;
import com.GiaoThongTM.demo.dtos.response.SuggestResponse;
import com.GiaoThongTM.demo.services.AIService.SuggestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class SuggestController {

    @Autowired
    private SuggestService suggestService;

    @PostMapping("/suggest")
    public SuggestResponse suggestStation(@RequestBody SuggestRequest request) {
        return suggestService.getSuggestion(request);
    }
}
