package com.ecomove.backend.service;

import com.ecomove.backend.model.Vehicle;

import java.util.List;

public interface VehicleService {
    List<Vehicle> getNearbyVehicles(double lat, double lng);

    // ✅ Thêm vào đây
    List<Vehicle> getAllVehicles();

    Vehicle save(Vehicle vehicle);
}
