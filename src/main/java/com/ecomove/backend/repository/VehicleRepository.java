package com.ecomove.backend.repository;

import com.ecomove.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // Sau này có thể thêm custom query nếu muốn
}
