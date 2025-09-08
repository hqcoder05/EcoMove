package com.GiaoThongTM.demo.stations.repositories;

import com.GiaoThongTM.demo.stations.entities.Station;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface StationRepository extends JpaRepository<Station, UUID> {

    List<Station> findByStationNameContainingIgnoreCase(String keyword);

    List<Station> findByDistrictContainingIgnoreCase(String keyword);

    long countByAvailableSlotsGreaterThan(int value);

    long countByAvailableSlotsEquals(int value);

    // Top N theo tổng sức chứa
    @Query("select s from Station s order by s.totalSlots desc")
    List<Station> findTopByCapacity(Pageable pageable);

    // Top N theo số xe đang chiếm chỗ (occupied = total - available)
    @Query("select s from Station s order by (s.totalSlots - s.availableSlots) desc")
    List<Station> findTopByOccupied(Pageable pageable);
}
