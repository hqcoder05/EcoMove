package com.GiaoThongTM.demo.vehicles.repositories;

import com.GiaoThongTM.demo.vehicles.entities.Vehicle;
import com.GiaoThongTM.demo.vehicles.enums.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID>, JpaSpecificationExecutor<Vehicle> {

    // ---- Tải kèm quan hệ stations để tránh N+1 khi cần ----
    @EntityGraph(attributePaths = "stations")
    @Query("select v from Vehicle v")
    List<Vehicle> findAllWithStations();

    // Có thể redeclare findById để gắn EntityGraph (tuỳ lúc cần)
    @EntityGraph(attributePaths = "stations")
    Optional<Vehicle> findById(UUID id);

    // ---- Các filter phổ biến cho list trang/ lọc ----
    Page<Vehicle> findAll(Pageable pageable);

    Page<Vehicle> findByStatus(VehicleStatus status, Pageable pageable);

    Page<Vehicle> findByTypeIgnoreCase(String type, Pageable pageable);

    Page<Vehicle> findByStatusAndTypeIgnoreCase(VehicleStatus status, String type, Pageable pageable);

    Page<Vehicle> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // ---- Bổ sung cho BookingService ----
    // Tìm 1 xe khả dụng tại trạm theo loại (type) — status = AVAILABLE
    @Query("""
           select v from Vehicle v
           join v.stations s
           where s.stationId = :stationId
             and lower(v.type) = lower(:type)
             and v.status = :status
           """)
    Optional<Vehicle> findAvailableVehicleByStatus(@Param("stationId") UUID stationId,
                                                   @Param("type") String type,
                                                   @Param("status") VehicleStatus status);

    // Giữ đúng chữ ký mà BookingService đang gọi
    default Optional<Vehicle> findAvailableVehicle(UUID stationId, String type) {
        return findAvailableVehicleByStatus(stationId, type, VehicleStatus.AVAILABLE);
    }
}
