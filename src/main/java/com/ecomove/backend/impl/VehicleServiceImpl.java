package com.ecomove.backend.impl;

import com.ecomove.backend.model.Vehicle;
import com.ecomove.backend.repository.VehicleRepository;
import com.ecomove.backend.service.VehicleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleServiceImpl(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public List<Vehicle> getNearbyVehicles(double lat, double lng) {
        // Giả sử là trả về tất cả, bạn có thể thay đổi bằng thuật toán theo vị trí
        return vehicleRepository.findAll();
    }

    @Override
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Override
    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }
}
