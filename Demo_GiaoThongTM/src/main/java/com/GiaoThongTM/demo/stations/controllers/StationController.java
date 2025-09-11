package com.GiaoThongTM.demo.stations.controllers;

import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.stations.projections.StationQuickView;
import com.GiaoThongTM.demo.stations.services.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/stations", produces = "application/json")
@CrossOrigin("*")
@RequiredArgsConstructor
@Validated
public class StationController {

    private final StationService stationService;

    // Phân trang tránh tải toàn bảng
    @GetMapping
    public Page<Station> getAllStations(@RequestParam(defaultValue = "0") @Min(0) int page,
                                        @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return stationService.getAllStationsPaged(PageRequest.of(page, size));
    }

    @PostMapping
    public Station saveStation(@RequestBody Station station) {
        return stationService.save(station);
    }

    @PutMapping("/{id}")
    public Station updateStation(@PathVariable UUID id, @RequestBody Station station) {
        return stationService.updateStation(id, station);
    }

    @DeleteMapping("/{id}")
    public void deleteStation(@PathVariable UUID id) {
        stationService.deleteStation(id);
    }

    // NEARBY tối ưu: trả projection nhẹ, chọn PostGIS/NoPostGIS
    @GetMapping("/nearby")
    public List<StationQuickView> getNearbyStations(@RequestParam double lat,
                                                    @RequestParam double lng,
                                                    @RequestParam(defaultValue = "5") @Min(1) @Max(50) int limit,
                                                    @RequestParam(defaultValue = "10") @Positive double radiusKm,
                                                    @RequestParam(defaultValue = "true") boolean onlyAvailable,
                                                    @RequestParam(defaultValue = "true") boolean usePostgis) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);             // 1..50
        double safeRadius = Math.min(Math.max(radiusKm, 0.1), 50.0);  // 0.1..50 km
        return stationService.getNearbyStations(lat, lng, safeLimit, safeRadius, onlyAvailable, usePostgis);
    }

    @GetMapping("/status")
    public List<Station> getStationsByStatus(@RequestParam String status) {
        return stationService.findStationsByStatus(status);
    }

    @GetMapping("/search")
    public List<Station> searchStationsByName(@RequestParam String keyword) {
        return stationService.findStationsByName(keyword);
    }

    @GetMapping("/count")
    public long countStations() {
        return stationService.countStations();
    }

    @GetMapping("/count-status")
    public long countStationsByStatus(@RequestParam String status) {
        return stationService.countStationsByStatus(status);
    }

    @PutMapping("/{id}/status")
    public Station updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return stationService.updateStatus(id, status);
    }

    @GetMapping("/available")
    public List<Station> getStationsWithAvailableVehicles() {
        return stationService.getStationsWithAvailableVehicles();
    }

    @GetMapping("/full")
    public List<Station> getFullStations() {
        return stationService.getFullStations();
    }

    @GetMapping("/predict-running-out")
    public List<Station> predictStationsRunningOut(@RequestParam(defaultValue = "10") int minutesAhead) {
        return stationService.predictStationsRunningOut(minutesAhead);
    }

    @GetMapping("/predict-getting-full")
    public List<Station> predictStationsGettingFull(@RequestParam(defaultValue = "10") int minutesAhead) {
        return stationService.predictStationsGettingFull(minutesAhead);
    }

    @GetMapping("/max-capacity")
    public Station getStationWithMaxCapacity() {
        return stationService.findStationWithMaxCapacity();
    }

    @GetMapping("/most-vehicles")
    public Station getStationWithMostVehicles() {
        return stationService.findStationWithMostVehicles();
    }

    @GetMapping("/most-space")
    public Station getStationWithMostSpace() {
        return stationService.findStationWithMostSpace();
    }

    @GetMapping("/min-vehicles")
    public Station getStationWithMinVehicles() {
        return stationService.findStationWithMinVehicles();
    }

    @GetMapping("/average-vehicles")
    public double getAverageVehicles() {
        return stationService.getAverageVehicles();
    }

    @GetMapping("/top/{n}")
    public List<Station> getTopNStations(@PathVariable @Min(1) @Max(100) int n) {
        return stationService.findTopNStations(n);
    }
}
