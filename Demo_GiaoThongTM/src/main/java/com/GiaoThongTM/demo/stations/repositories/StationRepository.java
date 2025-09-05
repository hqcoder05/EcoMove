package com.GiaoThongTM.demo.stations.repositories;

import com.GiaoThongTM.demo.stations.entities.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StationRepository extends JpaRepository<Station, Object> {
}
