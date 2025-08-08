package com.ecomove.backend.repository;

import com.ecomove.backend.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationRepository extends JpaRepository<Station, Long> {
    // có thể thêm truy vấn tuỳ chỉnh nếu cần
}
