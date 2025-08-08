package com.ecomove.backend.controller;

import com.ecomove.backend.model.Station;
import com.ecomove.backend.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    @Autowired
    private StationService stationService;

    @GetMapping
    public List<Station> getAllStations() {
        return stationService.getAllStations();
    }

    @PostMapping
    public Station saveStation(@RequestBody Station station) {
        return stationService.save(station);
    }

    @GetMapping("/nearby")
    public List<Station> getNearbyStations(@RequestParam double lat, @RequestParam double lng) {
        return stationService.getNearbyStations(lat, lng);
    }
}
