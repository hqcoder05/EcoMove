package com.GiaoThongTM.demo.stations.repositories;

import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.stations.projections.StationQuickView;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface StationRepository extends JpaRepository<Station, UUID> {

    // ======== Search ========
    List<Station> findByStationNameContainingIgnoreCase(String keyword);
    List<Station> findByDistrictContainingIgnoreCase(String keyword);

    // ======== Counts ========
    long countByAvailableSlotsGreaterThan(int value);
    long countByAvailableSlotsEquals(int value);

    // ======== Lists by availability ========
    List<Station> findByAvailableSlotsGreaterThan(int value);
    List<Station> findByAvailableSlotsEquals(int value);

    // ======== Top N ========
    @Query("select s from Station s order by s.totalSlots desc")
    List<Station> findTopByCapacity(Pageable pageable);

    @Query("select s from Station s order by (coalesce(s.totalSlots,0) - coalesce(s.availableSlots,0)) desc")
    List<Station> findTopByOccupied(Pageable pageable);

    @Query("select s from Station s order by coalesce(s.availableSlots,0) desc")
    List<Station> findTopByMostSpace(Pageable pageable);

    @Query("select s from Station s order by (coalesce(s.totalSlots,0) - coalesce(s.availableSlots,0)) asc")
    List<Station> findTopByMinVehicles(Pageable pageable);

    @Query("select avg(coalesce(s.totalSlots,0) - coalesce(s.availableSlots,0)) from Station s")
    Double avgOccupied();

    // ======== Heuristics (đổi table name -> stations) ========
    @Query(value = """
        SELECT * FROM stations
        WHERE COALESCE(total_slots,0) > 0
          AND COALESCE(available_slots,0) <= GREATEST(1, CEIL(COALESCE(total_slots,0) * :ratio))
        """, nativeQuery = true)
    List<Station> findRunningOut(@Param("ratio") double ratio);

    @Query(value = """
        SELECT * FROM stations
        WHERE COALESCE(total_slots,0) > 0
          AND COALESCE(available_slots,0) >= CEIL(COALESCE(total_slots,0) * :ratio)
        """, nativeQuery = true)
    List<Station> findGettingFull(@Param("ratio") double ratio);

    // =========================================================
    // ============== NEARBY QUERIES (QUAN TRỌNG) =============
    // Projection StationQuickView:
    //   String getId();
    //   String getName();
    //   Double getLat();
    //   Double getLon();
    //   Integer getTotalSlots();
    //   Integer getAvailableSlots();
    //   Double getDistKm();
    // =========================================================

    // ---------- B1. KHÔNG PostGIS (chạy chắc chắn) ----------
    @Query(value = """
        WITH bbox AS (
          SELECT :lat AS lat0, :lng AS lon0, :radiusKm AS rkm, 111.32 AS degKm
        )
        SELECT s.station_id AS id,
               s.station_name AS name,
               s.lat AS lat, s.lon AS lon,
               s.total_slots AS totalSlots,
               s.available_slots AS availableSlots,
               (
                 2*6371*ASIN(SQRT(
                   POWER(SIN(RADIANS(s.lat-b.lat0)/2),2) +
                   COS(RADIANS(b.lat0))*COS(RADIANS(s.lat))*
                   POWER(SIN(RADIANS(s.lon-b.lon0)/2),2)
                 ))
               ) AS distKm
        FROM stations s CROSS JOIN bbox b
        WHERE s.lat IS NOT NULL AND s.lon IS NOT NULL
          AND (:onlyAvailable = false OR s.available_slots > 0)
          AND s.lat BETWEEN (b.lat0 - b.rkm/b.degKm) AND (b.lat0 + b.rkm/b.degKm)
          AND s.lon BETWEEN (b.lon0 - b.rkm/(b.degKm*COS(RADIANS(b.lat0))))
                        AND (b.lon0 + b.rkm/(b.degKm*COS(RADIANS(b.lat0))))
        ORDER BY distKm ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<StationQuickView> findNearbyNoPostgis(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("limit") int limit,
            @Param("radiusKm") double radiusKm,
            @Param("onlyAvailable") boolean onlyAvailable
    );

    // ---------- B2. CÓ PostGIS (chỉ bật nếu có cột geog) ----------
    // Cần: EXTENSION postgis + cột stations.geog geography(Point,4326) + index GIST
    //   ALTER TABLE stations ADD COLUMN IF NOT EXISTS geog geography(Point,4326);
    //   UPDATE stations SET geog = ST_SetSRID(ST_MakePoint(lon,lat),4326) WHERE geog IS NULL AND lat IS NOT NULL AND lon IS NOT NULL;
    //   CREATE INDEX IF NOT EXISTS stations_geog_gist ON stations USING GIST (geog);
    @Query(value = """
        SELECT s.station_id AS id,
               s.station_name AS name,
               s.lat AS lat,
               s.lon AS lon,
               s.total_slots AS totalSlots,
               s.available_slots AS availableSlots,
               ST_Distance(
                 s.geog,
                 ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography
               )/1000.0 AS distKm
        FROM stations s
        WHERE s.lat IS NOT NULL AND s.lon IS NOT NULL
          AND (:onlyAvailable = false OR s.available_slots > 0)
          AND (:radiusM IS NULL OR
               ST_DWithin(
                 s.geog,
                 ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography,
                 :radiusM
               ))
        ORDER BY s.geog <-> ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography
        LIMIT :limit
        """, nativeQuery = true)
    List<StationQuickView> findNearbyPostgis(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("limit") int limit,
            @Param("radiusM") Integer radiusM,
            @Param("onlyAvailable") boolean onlyAvailable
    );
}
