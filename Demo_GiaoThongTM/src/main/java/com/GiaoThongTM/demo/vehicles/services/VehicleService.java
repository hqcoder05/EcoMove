package com.GiaoThongTM.demo.vehicles.services;

import com.GiaoThongTM.demo.vehicles.entities.Vehicle;
import java.util.List;

public interface VehicleService {
    List<Vehicle> getAllVehicles();

    Vehicle save(Vehicle vehicle);

    List<Vehicle> getNearbyVehicles(double lat, double lng, int limit, double radiusKm, boolean onlyAvailable);

    Vehicle getVehicleById(Long id);

    void deleteVehicle(Long id);
}

