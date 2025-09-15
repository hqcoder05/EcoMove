package com.GiaoThongTM.demo.stations.services;

import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.stations.projections.StationQuickView;
import com.GiaoThongTM.demo.stations.repositories.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;

    // === THÊM MỚI: dùng cho GET /stations có phân trang ===
    public Page<Station> getAllStationsPaged(Pageable pageable) {
        return stationRepository.findAll(pageable);
    }

    // (Legacy) Lấy toàn bộ – chỉ dùng khi thật sự cần
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    public Station save(Station station) {
        if (station.getAvailableSlots() == null) {
            station.setAvailableSlots(Math.max(0, Optional.ofNullable(station.getTotalSlots()).orElse(0)));
        }
        return stationRepository.save(station);
    }

    public Station updateStation(UUID id, Station newData) {
        Station s = stationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Station not found: " + id));

        if (newData.getStationName() != null)    s.setStationName(newData.getStationName());
        if (newData.getDistrict() != null)       s.setDistrict(newData.getDistrict());
        if (newData.getLat() != null)            s.setLat(newData.getLat());
        if (newData.getLon() != null)            s.setLon(newData.getLon());
        if (newData.getTotalSlots() != null)     s.setTotalSlots(newData.getTotalSlots());
        if (newData.getAvailableSlots() != null) s.setAvailableSlots(newData.getAvailableSlots());

        return stationRepository.save(s);
    }

    // Nearby tối ưu: gọi query ở Repository, KHÔNG dùng findAll()
    public List<StationQuickView> getNearbyStations(double lat, double lng, int limit, double radiusKm,
                                                    boolean onlyAvailable, boolean usePostgis) {
        if (usePostgis) {
            Integer radiusM = (radiusKm > 0) ? (int) Math.round(radiusKm * 1000) : null;
            return stationRepository.findNearbyPostgis(lat, lng, limit, radiusM, onlyAvailable);
        } else {
            double r = (radiusKm > 0) ? radiusKm : 30.0;
            return stationRepository.findNearbyNoPostgis(lat, lng, limit, r, onlyAvailable);
        }
    }

    // Trạng thái
    public List<Station> findStationsByStatus(String status) {
        String s = status == null ? "" : status.trim().toLowerCase();
        if (s.equals("hoạt động") || s.equals("available") || s.equals("active")) {
            return stationRepository.findByAvailableSlotsGreaterThan(0);
        }
        if (s.equals("hết chỗ") || s.equals("full")) {
            return stationRepository.findByAvailableSlotsEquals(0);
        }
        return stationRepository.findAll();
    }

    // Tìm theo tên/quận (không kéo toàn bảng nếu có keyword)
    public List<Station> findStationsByName(String keyword) {
        if (keyword == null || keyword.isBlank()) return stationRepository.findAll();
        Set<Station> set = new LinkedHashSet<>();
        set.addAll(stationRepository.findByStationNameContainingIgnoreCase(keyword));
        set.addAll(stationRepository.findByDistrictContainingIgnoreCase(keyword));
        return new ArrayList<>(set);
    }

    public long countStations() {
        return stationRepository.count();
    }

    public long countStationsByStatus(String status) {
        String s = status == null ? "" : status.trim().toLowerCase();
        if (s.equals("hoạt động") || s.equals("available") || s.equals("active")) {
            return stationRepository.countByAvailableSlotsGreaterThan(0);
        } else if (s.equals("hết chỗ") || s.equals("full")) {
            return stationRepository.countByAvailableSlotsEquals(0);
        }
        return stationRepository.count();
    }

    public void deleteStation(UUID id) {
        if (!stationRepository.existsById(id)) throw new NoSuchElementException("Station not found: " + id);
        stationRepository.deleteById(id);
    }

    public Station updateStatus(UUID id, String status) {
        Station s = stationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Station not found: " + id));
        String st = status == null ? "" : status.trim().toLowerCase();
        if (st.equals("hoạt động") || st.equals("available") || st.equals("active")) {
            int avail = Optional.ofNullable(s.getAvailableSlots()).orElse(0);
            int total = Optional.ofNullable(s.getTotalSlots()).orElse(0);
            s.setAvailableSlots(Math.max(1, Math.min(avail, total)));
        } else if (st.equals("hết chỗ") || st.equals("full") || st.equals("inactive")) {
            s.setAvailableSlots(0);
        }
        return stationRepository.save(s);
    }

    public List<Station> getStationsWithAvailableVehicles() {
        return stationRepository.findByAvailableSlotsGreaterThan(0);
    }

    public List<Station> getFullStations() {
        return stationRepository.findByAvailableSlotsEquals(0);
    }

    public List<Station> predictStationsRunningOut(int minutesAhead) {
        return stationRepository.findRunningOut(0.10); // <=10% tổng chỗ
    }

    public List<Station> predictStationsGettingFull(int minutesAhead) {
        return stationRepository.findGettingFull(0.20); // <=20% tổng chỗ
    }

    public Station findStationWithMaxCapacity() {
        return stationRepository.findTopByCapacity(PageRequest.of(0, 1))
                .stream().findFirst()
                .orElseThrow(() -> new NoSuchElementException("No station"));
    }

    public Station findStationWithMostVehicles() {
        return stationRepository.findTopByOccupied(PageRequest.of(0, 1))
                .stream().findFirst()
                .orElseThrow(() -> new NoSuchElementException("No station"));
    }

    public Station findStationWithMostSpace() {
        return stationRepository.findTopByMostSpace(PageRequest.of(0, 1))
                .stream().findFirst()
                .orElseThrow(() -> new NoSuchElementException("No station"));
    }

    public Station findStationWithMinVehicles() {
        return stationRepository.findTopByMinVehicles(PageRequest.of(0, 1))
                .stream().findFirst()
                .orElseThrow(() -> new NoSuchElementException("No station"));
    }

    public double getAverageVehicles() {
        return Optional.ofNullable(stationRepository.avgOccupied()).orElse(0.0);
    }

    public List<Station> findTopNStations(int n) {
        return stationRepository.findTopByCapacity(PageRequest.of(0, Math.max(1, n)));
    }
}
