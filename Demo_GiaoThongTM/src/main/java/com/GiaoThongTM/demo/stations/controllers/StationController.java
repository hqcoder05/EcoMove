package com.GiaoThongTM.demo.stations.controllers;

import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.stations.services.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/stations")
@CrossOrigin("*")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    @GetMapping
    public List<Station> getAllStations() {
        return stationService.getAllStations();
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

    @GetMapping("/nearby")
    public List<Station> getNearbyStations(@RequestParam double lat, @RequestParam double lng,
                                           @RequestParam(defaultValue = "5") int limit,
                                           @RequestParam(defaultValue = "10") double radiusKm,
                                           @RequestParam(defaultValue = "true") boolean onlyAvailable) {
        return stationService.getNearbyStations(lat, lng, limit, radiusKm, onlyAvailable);
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
    public List<Station> getTopNStations(@PathVariable int n) {
        return stationService.findTopNStations(n);
    }
}
