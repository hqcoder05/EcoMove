package com.ecomove.backend.controller;

import com.ecomove.backend.model.Vehicle;
import com.ecomove.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin("*")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    // API lấy các phương tiện gần vị trí
    @GetMapping("/nearby")
    public ResponseEntity<List<Vehicle>> getNearbyVehicles(
            @RequestParam double lat,
            @RequestParam double lng) {
        List<Vehicle> nearbyVehicles = vehicleService.getNearbyVehicles(lat, lng);
        return ResponseEntity.ok(nearbyVehicles);
    }

    // API lấy toàn bộ phương tiện
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    // API thêm phương tiện mới (nếu cần dùng Postman để insert test)
    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.save(vehicle));
    }
}
